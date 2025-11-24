# Factory Event Log System

A comprehensive web application to track incidents, maintenance, and safety events in manufacturing facilities.

![Factory Event Log System](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Dashboard
- **Real-time Statistics**: Track total incidents, maintenance events, and safety reports
- **Critical Alerts**: Monitor open critical events requiring immediate attention
- **Visual Analytics**: Bar charts showing events by severity and status
- **Recent Activity**: View events from the last 7 days

### Event Management
- **Create Events**: Log new incidents, maintenance activities, or safety events
- **Event Types**:
  - 🚨 Incidents (equipment failures, quality issues, power outages)
  - 🔧 Maintenance (scheduled inspections, repairs, equipment servicing)
  - 🛡️ Safety (near misses, spills, safety violations)

### Severity Levels
- **Low**: Routine events with minimal impact
- **Medium**: Events requiring attention but not urgent
- **High**: Serious events requiring prompt action
- **Critical**: Emergency situations requiring immediate response

### Status Tracking
- **Open**: Newly reported, awaiting action
- **In Progress**: Currently being addressed
- **Resolved**: Issue fixed, awaiting verification
- **Closed**: Completed and verified

### Advanced Filtering
- Filter by event type, severity, or status
- Search across titles, descriptions, and locations
- Sort by date, severity, or status
- Date range filtering

### Event Details
- Full event information with timeline
- Update event status and add resolution notes
- Track reporter and location information
- View complete event history

## Technology Stack

### Backend
- **Node.js** + **Express**: RESTful API server
- **better-sqlite3**: Embedded SQLite database
- **CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies
- **Responsive Design**: Mobile-first approach

## Installation

### Prerequisites
- Node.js 14.x or higher
- npm or yarn

### Setup

1. **Navigate to the project directory**
   ```bash
   cd factory-logs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```
   This creates the SQLite database and adds sample data.

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
factory-logs/
├── backend/
│   ├── server.js          # Express API server
│   └── init-db.js         # Database initialization script
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── style.css      # Application styles
│   └── js/
│       └── app.js         # Frontend JavaScript
├── database/
│   └── factory-logs.db    # SQLite database (created on init)
├── package.json           # Dependencies and scripts
└── README.md             # Documentation
```

## API Endpoints

### Events

#### Get All Events
```http
GET /api/events
```
Query parameters:
- `type`: Filter by event type (incident, maintenance, safety)
- `severity`: Filter by severity (low, medium, high, critical)
- `status`: Filter by status (open, in_progress, resolved, closed)
- `search`: Search in title, description, location
- `startDate`: Filter events from date
- `endDate`: Filter events until date
- `sortBy`: Sort field (default: created_at)
- `order`: Sort order (ASC, DESC)

#### Get Single Event
```http
GET /api/events/:id
```

#### Create Event
```http
POST /api/events
Content-Type: application/json

{
  "type": "incident",
  "title": "Machine malfunction",
  "description": "Detailed description",
  "severity": "high",
  "location": "Production Line 3",
  "reporter": "John Doe"
}
```

#### Update Event
```http
PUT /api/events/:id
Content-Type: application/json

{
  "status": "resolved",
  "resolution": "Issue fixed and tested"
}
```

#### Delete Event
```http
DELETE /api/events/:id
```

### Statistics

#### Get Dashboard Statistics
```http
GET /api/stats
```

Returns:
- Events count by type
- Events count by severity
- Events count by status
- Recent events count (last 7 days)
- Critical open events count

## Database Schema

### Events Table

| Column      | Type     | Description                              |
|-------------|----------|------------------------------------------|
| id          | INTEGER  | Primary key (auto-increment)             |
| type        | TEXT     | Event type (incident/maintenance/safety) |
| title       | TEXT     | Event title                              |
| description | TEXT     | Detailed description                     |
| severity    | TEXT     | Severity level (low/medium/high/critical)|
| location    | TEXT     | Physical location of event               |
| reporter    | TEXT     | Name of person reporting                 |
| status      | TEXT     | Current status (open/in_progress/etc)    |
| resolution  | TEXT     | Resolution notes (nullable)              |
| created_at  | DATETIME | Creation timestamp                       |
| updated_at  | DATETIME | Last update timestamp                    |

Indexes are created on: type, severity, status, created_at for optimal query performance.

## Usage Guide

### Creating an Event

1. Click the **"+ New Event"** button
2. Fill in the required fields:
   - **Type**: Select incident, maintenance, or safety
   - **Title**: Brief description of the event
   - **Severity**: Choose appropriate severity level
   - **Location**: Physical location (e.g., "Production Line 3")
   - **Reporter**: Your name
   - **Description**: Detailed description of what happened
3. Click **"Create Event"**

### Updating Event Status

1. Click on any event card to view details
2. Click **"Update Status"** button
3. Change the status and add resolution notes
4. Click **"Update Status"** to save

### Filtering Events

Use the filters in the action bar to:
- Filter by event type using the type dropdown
- Filter by severity level
- Filter by status
- Search for specific keywords

### Best Practices

#### For Incidents
- Report immediately when they occur
- Include all relevant details
- Update status as the situation progresses
- Document the root cause in resolution notes

#### For Maintenance
- Log scheduled maintenance activities
- Track completion and any issues found
- Note next scheduled maintenance date in resolution

#### For Safety Events
- Report all near misses, even if no injury occurred
- Document corrective actions taken
- Include witness information if applicable

## Configuration

### Environment Variables

You can customize the application using environment variables:

```bash
PORT=3000  # Server port (default: 3000)
```

### Changing the Database Location

Edit `backend/server.js` and `backend/init-db.js` to modify the database path:

```javascript
const dbPath = path.join(__dirname, '..', 'database', 'factory-logs.db');
```

## Security Considerations

1. **Input Validation**: All inputs are validated on the server
2. **SQL Injection Protection**: Using parameterized queries
3. **XSS Prevention**: HTML escaping on frontend
4. **CORS**: Configured for same-origin by default

### Production Deployment

For production use, consider:
- Adding authentication/authorization
- Using HTTPS
- Implementing rate limiting
- Setting up regular database backups
- Adding logging and monitoring
- Using a production-grade database (PostgreSQL, MySQL)

## Troubleshooting

### Database Errors

If you see database errors, try:
```bash
# Remove existing database
rm database/factory-logs.db

# Reinitialize
npm run init-db
```

### Port Already in Use

If port 3000 is already in use:
```bash
PORT=3001 npm start
```

### Dependencies Issues

If you encounter dependency issues:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

Potential features for future versions:
- [ ] User authentication and role-based access
- [ ] File attachments (photos, documents)
- [ ] Email notifications for critical events
- [ ] Export to PDF/Excel
- [ ] Advanced reporting and analytics
- [ ] Integration with existing systems
- [ ] Mobile application
- [ ] Real-time updates with WebSockets
- [ ] Multi-facility support
- [ ] Audit trail and change history

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

MIT License - feel free to use this project for your manufacturing facility.

## Support

For questions or issues, please open an issue on the project repository.

---

**Built with ❤️ for safer and more efficient manufacturing operations**
