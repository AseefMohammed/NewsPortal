import React from 'react';
import './EntityCard.css';

const EntityCard = ({ entity }) => {
  return (
    <div className="card">
      <span className="name">{entity.name}</span>
      <span className="info">Brief info about {entity.name} will appear here.</span>
      <span className="news">Latest news headline will appear here.</span>
      <a href="#" className="link">News Channel Link</a>
      <button className="archiveButton">Archive</button>
    </div>
  );
};

export default EntityCard;
```

```css
/* EntityCard.css */
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.name {
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 6px;
}

.info {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
}

.news {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
}

.link {
  margin-bottom: 8px;
  color: #007bff;
  text-decoration: underline;
  font-size: 14px;
}

.archiveButton {
  align-self: flex-end;
  background-color: #f1c40f;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}
```