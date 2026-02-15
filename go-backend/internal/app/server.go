package app

import (
	"fmt"
	"net/http"
)

type Server struct {
	host    string
	port    string
	handler http.Handler
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
	return http.ListenAndServe(address, s.handler)
}
