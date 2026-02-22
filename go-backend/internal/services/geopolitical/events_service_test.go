package geopolitical

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/acled"
	"tradeviewfusion/go-backend/internal/connectors/gdelt"
)

type fakeACLEDClient struct {
	events    []acled.Event
	err       error
	lastQuery acled.Query
}

func (f *fakeACLEDClient) FetchEvents(_ context.Context, query acled.Query) ([]acled.Event, error) {
	f.lastQuery = query
	if f.err != nil {
		return nil, f.err
	}
	return f.events, nil
}

type fakeGDELTClient struct {
	events    []gdelt.Event
	err       error
	lastQuery gdelt.Query
}

func (f *fakeGDELTClient) FetchEvents(_ context.Context, query gdelt.Query) ([]gdelt.Event, error) {
	f.lastQuery = query
	if f.err != nil {
		return nil, f.err
	}
	return f.events, nil
}

func TestEventsService_ListEvents_NormalizesFiltersForACLED(t *testing.T) {
	t.Parallel()

	acledClient := &fakeACLEDClient{
		events: []acled.Event{{ID: "1"}},
	}
	service := NewEventsService(acledClient, nil)

	events, err := service.ListEvents(context.Background(), Query{
		Source:       "acled",
		Country:      "  Ukraine  ",
		Region:       "  Eastern Europe ",
		EventType:    "  Battles ",
		SubEventType: "  Armed clash ",
		StartDate:    " 2026-01-01 ",
		EndDate:      " 2026-01-31 ",
		Limit:        0,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(events) != 1 {
		t.Fatalf("expected one event, got %d", len(events))
	}
	if acledClient.lastQuery.Country != "Ukraine" {
		t.Fatalf("expected normalized country, got %q", acledClient.lastQuery.Country)
	}
	if acledClient.lastQuery.EventType != "Battles" {
		t.Fatalf("expected normalized event type, got %q", acledClient.lastQuery.EventType)
	}
	if acledClient.lastQuery.Region != "Eastern Europe" {
		t.Fatalf("expected normalized region, got %q", acledClient.lastQuery.Region)
	}
	if acledClient.lastQuery.SubEventType != "Armed clash" {
		t.Fatalf("expected normalized sub-event type, got %q", acledClient.lastQuery.SubEventType)
	}
	if acledClient.lastQuery.StartDate != "2026-01-01" {
		t.Fatalf("expected normalized start date, got %q", acledClient.lastQuery.StartDate)
	}
	if acledClient.lastQuery.EndDate != "2026-01-31" {
		t.Fatalf("expected normalized end date, got %q", acledClient.lastQuery.EndDate)
	}
	if acledClient.lastQuery.Limit != 50 {
		t.Fatalf("expected default limit 50, got %d", acledClient.lastQuery.Limit)
	}
}

func TestEventsService_ListEvents_UsesGDELTSource(t *testing.T) {
	t.Parallel()

	gdeltClient := &fakeGDELTClient{
		events: []gdelt.Event{{ID: "gdelt-1"}},
	}
	service := NewEventsService(nil, gdeltClient)

	events, err := service.ListEvents(context.Background(), Query{
		Source:    "gdelt",
		Country:   "Ukraine",
		StartDate: "2026-01-01",
		EndDate:   "2026-01-31",
		Limit:     30,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(events) != 1 || events[0].ID != "gdelt-1" {
		t.Fatalf("expected mapped gdelt event, got %+v", events)
	}
	if gdeltClient.lastQuery.Country != "Ukraine" {
		t.Fatalf("expected country filter forwarded, got %q", gdeltClient.lastQuery.Country)
	}
	if gdeltClient.lastQuery.Limit != 30 {
		t.Fatalf("expected limit 30, got %d", gdeltClient.lastQuery.Limit)
	}
}

func TestEventsService_ListEvents_ClampsLimit(t *testing.T) {
	t.Parallel()

	acledClient := &fakeACLEDClient{}
	service := NewEventsService(acledClient, nil)

	_, err := service.ListEvents(context.Background(), Query{Limit: 9999})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if acledClient.lastQuery.Limit != 500 {
		t.Fatalf("expected clamped limit 500, got %d", acledClient.lastQuery.Limit)
	}
}

