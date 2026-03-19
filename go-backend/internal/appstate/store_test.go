package appstate

import (
	"path/filepath"
	"testing"
	"time"
)

func TestPreferencesRoundTrip(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "backend.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	saved, err := store.SavePreferences(Preferences{
		ProfileKey:      "paper-default",
		Favorites:       []string{"AAPL", "MSFT", "AAPL"},
		Layout:          LayoutTwoHorizontal,
		SidebarOpen:     true,
		ShowDrawingTool: true,
		DarkMode:        false,
	})
	if err != nil {
		t.Fatalf("save preferences: %v", err)
	}
	if len(saved.Favorites) != 2 {
		t.Fatalf("expected deduped favorites, got %+v", saved.Favorites)
	}

	got, err := store.GetPreferences("paper-default")
	if err != nil {
		t.Fatalf("get preferences: %v", err)
	}
	if got.Layout != LayoutTwoHorizontal {
		t.Fatalf("layout = %q, want %q", got.Layout, LayoutTwoHorizontal)
	}
	if len(got.Favorites) != 2 {
		t.Fatalf("favorites len = %d, want 2", len(got.Favorites))
	}
}

func TestUpdateUserRole(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "backend.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	now := "2026-03-17T12:00:00Z"
	if _, err := store.db.Exec(`
INSERT INTO User (id, email, name, role, createdAt, updatedAt) VALUES
('admin-1', 'admin@example.com', 'Admin', 'admin', ?, ?),
('user-1', 'user@example.com', 'User', 'viewer', ?, ?)
`, now, now, now, now); err != nil {
		t.Fatalf("seed users: %v", err)
	}

	updated, err := store.UpdateUserRole("admin-1", "user-1", "trader")
	if err != nil {
		t.Fatalf("update user role: %v", err)
	}
	if updated.Role != "trader" {
		t.Fatalf("role = %q, want trader", updated.Role)
	}
}

func TestUserLookupAndConsentRoundTrip(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "backend.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	now := "2026-03-17T12:00:00Z"
	if _, err := store.db.Exec(`
INSERT INTO User (id, email, name, role, createdAt, updatedAt)
VALUES ('user-2', 'consent@example.com', 'Consent User', 'viewer', ?, ?)
`, now, now); err != nil {
		t.Fatalf("seed user: %v", err)
	}

	user, err := store.GetUserByIDOrEmail("", "consent@example.com")
	if err != nil {
		t.Fatalf("get user by email: %v", err)
	}
	if user.ID != "user-2" {
		t.Fatalf("user id = %q, want user-2", user.ID)
	}

	consent, err := store.GetOrCreateUserConsent("user-2")
	if err != nil {
		t.Fatalf("get or create consent: %v", err)
	}
	if consent.LLMProcessing {
		t.Fatal("expected default llm consent false")
	}

	enable := true
	updated, err := store.UpdateUserConsent("user-2", &enable, nil, nil)
	if err != nil {
		t.Fatalf("update consent: %v", err)
	}
	if !updated.LLMProcessing {
		t.Fatal("expected llm consent true after update")
	}
}

func TestAuthStateHelpers(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "backend.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	now := "2026-03-17T12:00:00Z"
	if _, err := store.db.Exec(`
INSERT INTO User (id, email, username, name, role, passwordHash, createdAt, updatedAt)
VALUES ('auth-user', 'auth@example.com', 'auth-user', 'Auth User', 'viewer', 'scrypt$16384$8$1$CO7x4hQ9b_MhO7Jin0CeNQ$eToLrgrP0k5fYhF4m7HchPKM6m5AqLu6uf4fPrhCW3AF4LqFxy3rAKsvLKiVv7M5w8ABmIkfM7g3aQiPEEsdgA', ?, ?)
`, now, now); err != nil {
		t.Fatalf("seed auth user: %v", err)
	}

	if err := store.CreateTOTPSetup("auth-user", "secret-value", []string{"RECOVERY1", "RECOVERY2"}); err != nil {
		t.Fatalf("create totp setup: %v", err)
	}
	match, err := store.FindRecoveryCodeByEmail("auth@example.com", "RECOVERY1")
	if err != nil {
		t.Fatalf("find recovery code: %v", err)
	}
	if match.UserID != "auth-user" {
		t.Fatalf("recovery match user = %q, want auth-user", match.UserID)
	}
	if err := store.DeleteRecoveryCode(match.CodeID); err != nil {
		t.Fatalf("delete recovery code: %v", err)
	}
	if _, err := store.FindRecoveryCodeByEmail("auth@example.com", "RECOVERY1"); err == nil {
		t.Fatal("expected deleted recovery code lookup to fail")
	}

	expiresAt := time.Date(2026, 3, 18, 12, 0, 0, 0, time.UTC)
	if err := store.CreateVerificationToken("auth@example.com", "token-1", expiresAt); err != nil {
		t.Fatalf("create verification token: %v", err)
	}
	valid, err := store.GetValidVerificationToken("auth@example.com", "token-1", time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("get valid verification token: %v", err)
	}
	if !valid {
		t.Fatal("expected verification token to be valid")
	}
	if err := store.DeleteVerificationToken("auth@example.com", "token-1"); err != nil {
		t.Fatalf("delete verification token: %v", err)
	}
	valid, err = store.GetValidVerificationToken("auth@example.com", "token-1", time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("get deleted verification token: %v", err)
	}
	if valid {
		t.Fatal("expected deleted verification token to be invalid")
	}
}

func TestPasskeyAuthenticatorRoundTrip(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "backend.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	user, authenticators, err := store.GetOrCreateUserByEmail("passkey@example.com", "Passkey User", "viewer")
	if err != nil {
		t.Fatalf("get or create user by email: %v", err)
	}
	if user.ID == "" {
		t.Fatal("expected created user id")
	}
	if len(authenticators) != 0 {
		t.Fatalf("expected no authenticators initially, got %d", len(authenticators))
	}

	stored, err := store.UpsertAuthenticator(PasskeyAuthenticator{
		UserID:               user.ID,
		ProviderAccountID:    "cred-1",
		CredentialID:         "cred-1",
		CredentialPublicKey:  "public-key-1",
		Counter:              1,
		CredentialDeviceType: "singleDevice",
		CredentialBackedUp:   false,
		Transports:           []string{"internal", "usb"},
		Name:                 "Laptop Passkey",
	})
	if err != nil {
		t.Fatalf("upsert authenticator: %v", err)
	}
	if stored.ID == "" {
		t.Fatal("expected stored authenticator id")
	}

	loaded, owner, err := store.GetAuthenticatorByCredentialID("cred-1")
	if err != nil {
		t.Fatalf("get authenticator by credential id: %v", err)
	}
	if owner.ID != user.ID {
		t.Fatalf("owner id = %q, want %q", owner.ID, user.ID)
	}
	if loaded.CredentialID != "cred-1" {
		t.Fatalf("credential id = %q, want cred-1", loaded.CredentialID)
	}

	updated, err := store.UpdateAuthenticatorUsage("cred-1", 7, "multiDevice", true)
	if err != nil {
		t.Fatalf("update authenticator usage: %v", err)
	}
	if updated.Counter != 7 || !updated.CredentialBackedUp {
		t.Fatalf("unexpected updated authenticator: %+v", updated)
	}

	_, err = store.UpsertAuthenticator(PasskeyAuthenticator{
		UserID:               user.ID,
		ProviderAccountID:    "cred-2",
		CredentialID:         "cred-2",
		CredentialPublicKey:  "public-key-2",
		Counter:              0,
		CredentialDeviceType: "singleDevice",
		CredentialBackedUp:   false,
		Name:                 "Phone Passkey",
	})
	if err != nil {
		t.Fatalf("insert second authenticator: %v", err)
	}

	remaining, err := store.DeleteAuthenticatorForUser(user.ID, stored.ID)
	if err != nil {
		t.Fatalf("delete authenticator for user: %v", err)
	}
	if remaining != 1 {
		t.Fatalf("remaining authenticators = %d, want 1", remaining)
	}
}

func TestRegisterUserAndCredentialLookup(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "backend.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	user, err := store.RegisterUser(
		"login@example.com",
		"login_user",
		"Login User",
		"viewer",
		"scrypt$16384$8$1$CO7x4hQ9b_MhO7Jin0CeNQ$eToLrgrP0k5fYhF4m7HchPKM6m5AqLu6uf4fPrhCW3AF4LqFxy3rAKsvLKiVv7M5w8ABmIkfM7g3aQiPEEsdgA",
		[]string{"REG1"},
	)
	if err != nil {
		t.Fatalf("register user: %v", err)
	}
	if user.ID == "" {
		t.Fatal("expected registered user id")
	}

	found, err := store.FindUserForCredentials("login@example.com")
	if err != nil {
		t.Fatalf("find by email: %v", err)
	}
	if found.ID != user.ID {
		t.Fatalf("found id = %q, want %q", found.ID, user.ID)
	}

	found, err = store.FindUserForCredentials("login_user")
	if err != nil {
		t.Fatalf("find by username: %v", err)
	}
	if found.ID != user.ID {
		t.Fatalf("found username id = %q, want %q", found.ID, user.ID)
	}

	hasTOTP, err := store.HasActiveTOTP(user.ID)
	if err != nil {
		t.Fatalf("has active totp: %v", err)
	}
	if hasTOTP {
		t.Fatal("expected no totp initially")
	}

	if err := store.CreateTOTPSetup(user.ID, "secret", []string{"X1"}); err != nil {
		t.Fatalf("create totp setup: %v", err)
	}
	hasTOTP, err = store.HasActiveTOTP(user.ID)
	if err != nil {
		t.Fatalf("has active totp after setup: %v", err)
	}
	if !hasTOTP {
		t.Fatal("expected totp after setup")
	}
}

func TestOrdersAndAlertsRoundTrip(t *testing.T) {
	t.Parallel()

	store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "backend.db"))
	if err != nil {
		t.Fatalf("new sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close store: %v", err)
		}
	})

	order, err := store.CreatePaperOrder("paper-default", "AAPL", "buy", "market", 2, 150, nil, nil)
	if err != nil {
		t.Fatalf("create paper order: %v", err)
	}
	if order.ID == "" {
		t.Fatal("expected order id")
	}
	orders, err := store.ListPaperOrders("paper-default", "")
	if err != nil {
		t.Fatalf("list paper orders: %v", err)
	}
	if len(orders) != 1 {
		t.Fatalf("orders len = %d, want 1", len(orders))
	}
	updatedOrder, found, err := store.UpdatePaperOrderStatus("paper-default", order.ID, "filled")
	if err != nil {
		t.Fatalf("update paper order status: %v", err)
	}
	if !found || updatedOrder.Status != "filled" {
		t.Fatalf("unexpected updated order: %+v found=%v", updatedOrder, found)
	}

	alert, err := store.CreatePriceAlert("paper-default", "AAPL", "above", 200, true, "watch breakout")
	if err != nil {
		t.Fatalf("create price alert: %v", err)
	}
	if alert.ID == "" {
		t.Fatal("expected alert id")
	}
	alerts, err := store.ListPriceAlerts("paper-default", "")
	if err != nil {
		t.Fatalf("list price alerts: %v", err)
	}
	if len(alerts) != 1 {
		t.Fatalf("alerts len = %d, want 1", len(alerts))
	}
	triggeredAt := time.Date(2026, 3, 17, 15, 4, 5, 0, time.UTC).Format(time.RFC3339Nano)
	message := "triggered"
	updatedAlert, found, err := store.UpdatePriceAlert("paper-default", alert.ID, nil, ptrBool(true), &triggeredAt, &message)
	if err != nil {
		t.Fatalf("update price alert: %v", err)
	}
	if !found || !updatedAlert.Triggered {
		t.Fatalf("unexpected updated alert: %+v found=%v", updatedAlert, found)
	}
	deleted, err := store.DeletePriceAlert("paper-default", alert.ID)
	if err != nil {
		t.Fatalf("delete price alert: %v", err)
	}
	if !deleted {
		t.Fatal("expected alert to be deleted")
	}
}

func ptrBool(value bool) *bool {
	return &value
}
