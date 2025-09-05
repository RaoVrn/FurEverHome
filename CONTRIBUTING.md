# Contributing to FurEverHome 🐾

We love your input! We want to make contributing to FurEverHome as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, track issues and feature requests, as well as accept pull requests.

### 1. Fork & Clone
```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/FurEverHome.git
cd FurEverHome
```

### 2. Set up Development Environment
```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your local settings

# Frontend setup
cd ../client
npm install
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📋 Pull Request Process

1. **Update Documentation**: Ensure any install or build dependencies are documented
2. **Update Version Numbers**: Update version numbers in any examples files and the README
3. **Test Your Changes**: Run existing tests and add new ones for your code
4. **Clear Description**: Write a clear description of what your PR does

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
```

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/RaoVrn/FurEverHome/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template
```markdown
## Bug Description
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
- Node.js version:
- NPM version:

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

We love feature requests! They help us understand what users need. Before submitting:

1. **Check existing issues** to see if it's already been suggested
2. **Be specific** about the use case
3. **Explain the value** it would bring to users

### Feature Request Template
```markdown
## Feature Summary
A clear and concise description of the feature you'd like to see added.

## Problem Statement
What problem does this feature solve? Who would benefit from it?

## Proposed Solution
Describe the solution you'd like to see implemented.

## Alternative Solutions
Describe any alternative solutions or features you've considered.

## Additional Context
Add any other context, mockups, or examples about the feature request here.
```

## 🎨 Coding Standards

### Frontend (React)
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Use TypeScript-style prop validation

### Backend (Node.js)
- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Use middleware for common functionality
- Follow security best practices

### General Guidelines
- Write meaningful commit messages
- Keep functions small and focused
- Use descriptive variable names
- Comment complex logic
- Remove unused code and imports

## 🧪 Testing Guidelines

### Frontend Testing
```bash
cd client
npm test
```

- Write unit tests for utilities
- Test components with React Testing Library
- Test user interactions
- Aim for meaningful coverage, not just high percentages

### Backend Testing
```bash
cd backend
npm test
```

- Write unit tests for business logic
- Test API endpoints
- Test error scenarios
- Mock external dependencies

## 📝 Documentation Standards

- Update README.md for new features
- Add JSDoc comments for functions
- Update API documentation
- Include examples where helpful
- Keep documentation up to date with code changes

## 🏷️ Commit Message Convention

We follow a simplified version of [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(auth): add password reset functionality
fix(pets): resolve image upload error
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(api): simplify pet search logic
test(pets): add unit tests for pet controller
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔄 Release Process

1. All changes go through pull requests
2. Releases are tagged with semantic versioning
3. Changelog is automatically generated
4. Breaking changes are clearly documented

## 🆘 Getting Help

- **Discord**: Join our community server (coming soon)
- **GitHub Discussions**: For general questions and ideas
- **Issues**: For bug reports and feature requests
- **Email**: developers@fureverhome.com

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Special contributor badges

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@fureverhome.com.

---

## 🙏 Thank You

Thank you for your interest in contributing to FurEverHome! Every contribution, no matter how small, helps us build a better platform for pets and families worldwide.

**Together, we're making pet adoption easier and more accessible for everyone! 🐾❤️**
