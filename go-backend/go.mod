module tradeviewfusion/go-backend

go 1.25

require (
	github.com/thrasher-corp/gocryptotrader v0.0.0
	google.golang.org/grpc v1.78.0
)

require (
	github.com/gorilla/websocket v1.5.3 // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.27.7 // indirect
	golang.org/x/net v0.48.0 // indirect
	golang.org/x/sys v0.40.0 // indirect
	golang.org/x/text v0.33.0 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20260128011058-8636f8732409 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20260128011058-8636f8732409 // indirect
	google.golang.org/protobuf v1.36.11 // indirect
)

replace github.com/thrasher-corp/gocryptotrader => ./vendor-forks/gocryptotrader
