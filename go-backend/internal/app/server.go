package app

import (
	"fmt"
	"net/http"
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
	if s.closeFn != nil {
		defer func() { _ = s.closeFn() }()
	}
	return http.ListenAndServe(address, s.handler)
}

func (s *Server) Close() error {
	if s == nil || s.closeFn == nil {
		return nil
	}
	return s.closeFn()
}
