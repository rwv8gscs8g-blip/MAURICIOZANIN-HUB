// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

// Polyfill React.act for React 19 + legacy test-utils compatibility
if (!React.act) {
  React.act = require('react').act;
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Framer Motion for tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    li: ({ children, ...props }) => <li {...props}>{children}</li>,
    ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
  },
  AnimatePresence: ({ children }) => children,
}))
