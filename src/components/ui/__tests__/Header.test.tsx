import { render, screen } from '@testing-library/react'
import Header from '../Header'
import { AuthProvider } from '../../../lib/auth'

test('renders Nocturne header', ()=>{
  render(<AuthProvider><Header /></AuthProvider>)
  expect(screen.getByText('Nocturne')).toBeInTheDocument()
})
