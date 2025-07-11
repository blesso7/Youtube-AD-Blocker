# Contributing to YouTube AdBlock Pro

Thank you for considering contributing to YouTube AdBlock Pro! This document outlines the process and guidelines for contributing to our project.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in our community.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:

1. Check the [issue tracker](https://github.com/yourusername/youtube-adblock-pro/issues) to see if the problem has already been reported
2. If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/yourusername/youtube-adblock-pro/issues/new/choose)

When submitting a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior
- Actual behavior
- Browser name and version
- Extension version
- Screenshots (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

1. Check if the enhancement has already been suggested
2. Use a clear and descriptive title
3. Provide a detailed description of the suggested enhancement
4. Explain why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Ensure your code follows our style guide
5. Run tests if applicable
6. Submit a pull request

## Development Setup

1. **Prerequisites**:
   - Node.js (14.x or later)
   - npm or yarn

2. **Setup**:
   ```bash
   # Clone your fork
   git clone https://github.com/yourusername/youtube-adblock-pro.git
   
   # Navigate to the project directory
   cd youtube-adblock-pro
   
   # Install dependencies
   npm install
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **Testing the Extension**:
   - Open your browser
   - Load the extension from the `build` directory

## Style Guide

### JavaScript

- Use modern ES6+ features while maintaining browser compatibility
- Follow async/await patterns for better readability
- Implement proper error handling and logging
- Use meaningful variable and function names
- Add comments for complex logic, especially ad detection patterns

### CSS

- Follow the established design system with CSS custom properties
- Use flexbox and grid for layouts
- Implement smooth transitions and animations
- Maintain responsive design principles
- Keep the color scheme consistent (primary: #6366f1, success: #10b981, etc.)

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

## Testing

- Test on various YouTube page types (videos, shorts, search, home)
- Verify ad blocking effectiveness
- Check popup interface functionality
- Ensure no conflicts with YouTube's core functionality
- Test toggle states and settings persistence

## Translations

If you want to help translate the extension, please read our [Translation Guide](docs/contributing/TRANSLATIONS.md).

## Questions?

If you have any questions about contributing, please [open an issue](https://github.com/yourusername/youtube-adblock-pro/issues) with your question.

Thank you for your contributions!
