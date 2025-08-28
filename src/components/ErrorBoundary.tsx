"use client";

"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertIcon, AlertTitle, AlertDescription, Box, Button, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box p={8}>
          <Alert status="error" rounded="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>
                {this.state.error?.message || 'An unexpected error occurred'}
              </AlertDescription>
            </Box>
          </Alert>
          <VStack mt={4} spacing={2}>
            <Button onClick={this.handleReset} colorScheme="red" variant="outline">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} size="sm" variant="ghost">
              Reload Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;