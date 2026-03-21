package app

import (
	"fmt"
	"net/http"
	"time"
)

type Server struct {
	host    string
	port    string
	handler http.Handler
	closeFn func() error
}

func NewServer(host, port string, handler http.Handler) *Server {
	return &Server{
		host:    host,
		port:    port,
		handler: handler,
	}
}

func (s *Server) Run() error {
	address := fmt.Sprintf("%s:%s", s.host, s.port)
	server := &http.Server{
		Addr:              address,
		Handler:           s.handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	if s.closeFn != nil {
		defer func() { _ = s.closeFn() }()
	}
	if err := server.ListenAndServe(); err != nil {
		return fmt.Errorf("listen and serve gateway: %w", err)
	}
	return nil
}

func (s *Server) Close() error {
	if s == nil || s.closeFn == nil {
		return nil
	}
	return s.closeFn()
}
