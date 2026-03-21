package gct

import (
	"context"
	"errors"
	"io"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"

	"github.com/thrasher-corp/gocryptotrader/currency"
	gctrpc "github.com/thrasher-corp/gocryptotrader/gctrpc"
)

func (c *Client) GetOrderbook(ctx context.Context, exchange string, pair contracts.Pair, assetType string) (contracts.OrderbookSnapshot, error) {
	serviceClient, err := c.grpcServiceClient(ctx)
	if err != nil {
		return contracts.OrderbookSnapshot{}, err
	}

	requestContext, cancel := c.withTimeout(ctx)
	defer cancel()

	response, callErr := serviceClient.GetOrderbook(requestContext, &gctrpc.GetOrderbookRequest{
		Exchange: exchange,
		Pair: &gctrpc.CurrencyPair{
			Delimiter: "/",
			Base:      strings.ToUpper(strings.TrimSpace(pair.Base)),
			Quote:     strings.ToUpper(strings.TrimSpace(pair.Quote)),
		},
		AssetType: strings.ToLower(strings.TrimSpace(assetType)),
	})
	if callErr != nil {
		return contracts.OrderbookSnapshot{}, wrapRPCError("GetOrderbook", callErr)
	}
	return fromGRPCOrderbook(exchange, response), nil
}

func (c *Client) OpenOrderbookStream(ctx context.Context, exchange string, pair contracts.Pair, assetType string) (<-chan contracts.OrderbookSnapshot, <-chan error, error) {
	serviceClient, err := c.grpcServiceClient(ctx)
	if err != nil {
		return nil, nil, err
	}

	streamContext, cancel := c.withStreamContext(ctx)
	streamClient, streamErr := serviceClient.GetOrderbookStream(streamContext, &gctrpc.GetOrderbookStreamRequest{
		Exchange: exchange,
		Pair: &gctrpc.CurrencyPair{
			Delimiter: "/",
			Base:      strings.ToUpper(strings.TrimSpace(pair.Base)),
			Quote:     strings.ToUpper(strings.TrimSpace(pair.Quote)),
		},
		AssetType: strings.ToLower(strings.TrimSpace(assetType)),
	})
	if streamErr != nil {
		cancel()
		return nil, nil, wrapRPCError("GetOrderbookStream", streamErr)
	}

	snapshotChannel := make(chan contracts.OrderbookSnapshot)
	errorChannel := make(chan error, 1)

	go func() {
		defer cancel()
		defer close(snapshotChannel)
		defer close(errorChannel)

		for {
			response, recvErr := streamClient.Recv()
			if recvErr != nil {
				if errors.Is(recvErr, io.EOF) || ctx.Err() != nil {
					return
				}
				errorChannel <- wrapRPCError("GetOrderbookStream.Recv", recvErr)
				return
			}

			snapshot := fromGRPCOrderbook(exchange, response)
			select {
			case <-ctx.Done():
				return
			case snapshotChannel <- snapshot:
			}
		}
	}()

	return snapshotChannel, errorChannel, nil
}

func fromGRPCOrderbook(exchange string, response *gctrpc.OrderbookResponse) contracts.OrderbookSnapshot {
	if response == nil {
		return contracts.OrderbookSnapshot{}
	}

	pair := contracts.Pair{}
	if response.GetPair() != nil {
		pair = contracts.Pair{
			Base:  strings.ToUpper(strings.TrimSpace(response.GetPair().GetBase())),
			Quote: strings.ToUpper(strings.TrimSpace(response.GetPair().GetQuote())),
		}
	} else if parsed, ok := currency.NewPairFromString(response.GetCurrencyPair()); ok == nil {
		pair = contracts.Pair{
			Base:  strings.ToUpper(strings.TrimSpace(parsed.Base.String())),
			Quote: strings.ToUpper(strings.TrimSpace(parsed.Quote.String())),
		}
	}

	return contracts.OrderbookSnapshot{
		Exchange:  strings.TrimSpace(exchange),
		AssetType: strings.ToLower(strings.TrimSpace(response.GetAssetType())),
		Pair:      pair,
		Bids:      fromGRPCOrderbookItems(response.GetBids()),
		Asks:      fromGRPCOrderbookItems(response.GetAsks()),
		Timestamp: response.GetLastUpdated(),
		Source:    "gct",
	}
}

func fromGRPCOrderbookItems(items []*gctrpc.OrderbookItem) []contracts.OrderbookLevel {
	if len(items) == 0 {
		return nil
	}

	levels := make([]contracts.OrderbookLevel, 0, len(items))
	for _, item := range items {
		if item == nil {
			continue
		}
		levels = append(levels, contracts.OrderbookLevel{
			Price:  item.GetPrice(),
			Amount: item.GetAmount(),
			ID:     item.GetId(),
		})
	}
	return levels
}
