package examples

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID    string
	Email string
}

type UserRepository interface {
	GetByID(ctx context.Context, id string) (*User, error)
	Save(ctx context.Context, user *User) error
}

type PGXUserRepository struct {
	pool *pgxpool.Pool
}

func NewPGXUserRepository(pool *pgxpool.Pool) UserRepository {
	return &PGXUserRepository{pool: pool}
}

func (r *PGXUserRepository) GetByID(ctx context.Context, id string) (*User, error) {
	row := r.pool.QueryRow(ctx, "SELECT id, email FROM users WHERE id = $1", id)

	var u User
	if err := row.Scan(&u.ID, &u.Email); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("get user %q: %w", id, ErrNotFound)
		}
		return nil, fmt.Errorf("scan user %q: %w", id, err)
	}

	return &u, nil
}

func (r *PGXUserRepository) Save(ctx context.Context, user *User) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO users (id, email)
		VALUES ($1, $2)
		ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
	`, user.ID, user.Email)
	if err != nil {
		return fmt.Errorf("upsert user %q: %w", user.ID, err)
	}
	return nil
}
