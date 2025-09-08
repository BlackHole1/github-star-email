# GitHub Star Email Extractor

<div align="center">
  <p>
    <a href="https://github.com/BlackHole1/github-star-email/blob/main/LICENSE" target="_blank">
      <img src="https://img.shields.io/github/license/BlackHole1/github-star-email" alt="License" />
    </a>
  </p>
  <p>
    <a href="https://hub.oomol.com/package/github-star-email?open=true" target="_blank">
      <img src="https://static.oomol.com/assets/button.svg" alt="Open in OOMOL Studio" />
    </a>
  </p>
</div>

A powerful OOMOL block that extracts email addresses from all users who have starred a specific GitHub repository. Perfect for community outreach, marketing campaigns, and building connections with your project's supporters.

![Usage Example](./static/example.png)

## What This Block Does

This block automatically:
- 🌟 Fetches all users who have starred your GitHub repository
- 📧 Extracts their public email addresses
- 💾 Saves the data in an easy-to-use format (NDJSON)
- 🔄 Supports resume functionality if interrupted
- 📊 Shows real-time progress during extraction

## How to Use

### Prerequisites
You'll need a GitHub Personal Access Token to use this block:

1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new)
2. Create a new token with `read:user` permission
3. Copy the generated token

### Input Parameters

| Parameter | Description | Required | Example |
|-----------|-------------|----------|---------|
| **Owner** | The GitHub username or organization name | ✅ | `microsoft` |
| **Repository** | The repository name | ✅ | `vscode` |
| **GitHub Token** | Your personal access token | ✅ | `ghp_xxxxxxxxxxxx` |
| **Save As** | Where to save the results (.ndjson file) | ✅ | `stargazers.ndjson` |
| **Continue** | Resume from interruption | ⚪ | `true` (default) |

### Output

The block generates a file containing user information in NDJSON format:
```json
{"name": "John Doe", "email": "john@example.com"}
{"name": "Jane Smith", "email": "jane@example.com"}
```

## Use Cases

- **Community Outreach**: Connect with developers interested in your project
- **Newsletter Marketing**: Build an email list of engaged users
- **Partnership Opportunities**: Reach out to active community members
- **Research**: Analyze your project's user base
- **Event Invitations**: Notify stargazers about releases or events

## Features

### ⚡ Smart Rate Limiting
Automatically handles GitHub's API rate limits and provides clear error messages with wait times.

### 🔄 Resume Capability
If the process is interrupted, the block can continue from where it left off, saving time on large repositories.

### 📈 Real-time Progress
Visual progress bar shows completion percentage and estimated time remaining.

### 🎯 Email Filtering
Only extracts users who have made their email addresses public, respecting privacy.

### 📊 Large Repository Support
Efficiently handles repositories with thousands of stars through pagination.

## Technical Details

- **Runtime**: Node.js/TypeScript
- **API**: GitHub GraphQL API v4
- **Output Format**: Newline Delimited JSON (NDJSON)
- **Rate Limiting**: Automatic handling with retry logic
- **Memory Efficient**: Streams data to file instead of loading everything in memory

## Example Workflow

1. **Add the Block**: Drag the "Get Github Star Email" block to your OOMOL workflow
2. **Configure Inputs**: 
   - Owner: `facebook`
   - Repository: `react`
   - GitHub Token: Your personal access token
   - Save As: `react-stargazers.ndjson`
3. **Run**: The block will start extracting emails and show progress
4. **Results**: Find your email list in the specified output file

## Privacy & Ethics

This block only accesses publicly available information that users have chosen to make visible on their GitHub profiles. Always:
- ✅ Respect user privacy
- ✅ Follow applicable laws (GDPR, CAN-SPAM, etc.)
- ✅ Provide unsubscribe options in any communications
- ✅ Use collected emails responsibly

## Troubleshooting

### Common Issues

**"Rate limit exceeded"**
- Wait for the specified time or use a different GitHub token
- Consider using multiple tokens if you have large repositories

**"Repository not found"**
- Check that the owner and repository names are correct
- Ensure the repository is public

**"Token invalid"**
- Verify your GitHub token has the correct permissions
- Generate a new token if the old one has expired

### Need Help?

If you encounter issues or have questions, please check:
- GitHub API status at [status.github.com](https://status.github.com)
- OOMOL documentation for general usage
- GitHub token permissions and expiration

---

**Ready to connect with your community?** Add this block to your OOMOL workflow and start building meaningful relationships with your project's supporters! 🚀
