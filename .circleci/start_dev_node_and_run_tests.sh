#!/usr/bin/env bash

set -e

trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  npx ganache-cli --gasLimit 0x1fffffffffffff --gasPrice 0x1 --port "$ganache_port" -e 100000 --accounts 70 > /dev/null &
  ganache_pid=$!

  echo "Waiting for ganache to launch on port "$ganache_port"..."

  while ! ganache_running; do
    sleep 0.1
  done

  echo "Ganache launched!"
}

echo 'Test GGT Presale Step'

if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

npm "$@"
