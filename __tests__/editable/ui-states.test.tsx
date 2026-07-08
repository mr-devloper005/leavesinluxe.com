import { render, screen } from '@testing-library/react'
import { CardGridLoadingState, DetailLoadingState, PageLoadingState } from '@/editable/components/LoadingStates'
import { ContactSuccessState, EmptyState, TaskEmptyState } from '@/editable/components/EmptyStates'
import { assertContract } from '../helpers/contract'

describe('editable reusable UI states', () => {
  it('renders loading states with accessible busy indicators', () => {
    const { rerender } = render(<PageLoadingState label="Loading custom page" />)
    assertContract([
      {
        name: 'PageLoadingState label did not render',
        pass: Boolean(screen.queryByText('Loading custom page')),
        expected: 'Visible text: Loading custom page',
        actual: document.body.textContent,
        hint: 'If you redesign LoadingStates.tsx, keep the label visible for accessibility/debugging.',
        file: 'src/editable/components/LoadingStates.tsx',
      },
      {
        name: 'PageLoadingState missing aria-busy wrapper',
        pass: Boolean(screen.getByText('Loading custom page').closest('[aria-busy="true"]')),
        expected: 'A parent element with aria-busy="true"',
        actual: document.body.innerHTML,
        hint: 'Loading states must remain accessible to assistive technologies.',
        file: 'src/editable/components/LoadingStates.tsx',
      },
    ])

    rerender(<CardGridLoadingState count={2} />)
    assertContract([
      {
        name: 'CardGridLoadingState missing aria-busy marker',
        pass: document.querySelectorAll('[aria-busy="true"]').length > 0,
        expected: 'At least one aria-busy="true" element',
        actual: document.body.innerHTML,
        hint: 'Keep aria-busy on grid loading states.',
        file: 'src/editable/components/LoadingStates.tsx',
      },
    ])

    rerender(<DetailLoadingState label="Loading custom detail" />)
    assertContract([
      {
        name: 'DetailLoadingState label did not render',
        pass: Boolean(screen.queryByText('Loading custom detail')),
        expected: 'Visible text: Loading custom detail',
        actual: document.body.textContent,
        hint: 'Keep the passed label visible in detail loading UI.',
        file: 'src/editable/components/LoadingStates.tsx',
      },
    ])
  })

  it('renders empty states with actions', () => {
    const { rerender } = render(<EmptyState title="No posts" actionLabel="Go home" />)
    assertContract([
      {
        name: 'EmptyState heading did not render',
        pass: Boolean(screen.queryByRole('heading', { name: 'No posts' })),
        expected: 'Heading with text No posts',
        actual: document.body.textContent,
        hint: 'Empty states must keep a visible title so empty feeds are understandable.',
        file: 'src/editable/components/EmptyStates.tsx',
      },
      {
        name: 'EmptyState action link missing or wrong href',
        pass: screen.getByRole('link', { name: /go home/i }).getAttribute('href') === '/',
        expected: 'Link named Go home with href /',
        actual: screen.getByRole('link', { name: /go home/i }).getAttribute('href'),
        hint: 'Keep the action link wired to actionHref.',
        file: 'src/editable/components/EmptyStates.tsx',
      },
    ])

    rerender(<TaskEmptyState taskLabel="articles" />)
    assertContract([
      {
        name: 'TaskEmptyState dynamic title changed',
        pass: Boolean(screen.queryByRole('heading', { name: 'No articles available yet' })),
        expected: 'Heading: No articles available yet',
        actual: document.body.textContent,
        hint: 'TaskEmptyState should include the taskLabel in the title.',
        file: 'src/editable/components/EmptyStates.tsx',
      },
    ])

    rerender(<ContactSuccessState />)
    assertContract([
      {
        name: 'ContactSuccessState success title missing',
        pass: Boolean(screen.queryByRole('heading', { name: 'Message received' })),
        expected: 'Heading: Message received',
        actual: document.body.textContent,
        hint: 'Contact success confirmation must stay visible after form submission.',
        file: 'src/editable/components/EmptyStates.tsx',
      },
    ])
  })
})
