import reesAvatar from '../assets/pw5.jpg';
import bjornAvatar from '../assets/bjorn.jpg';

export const MOCK_USERS = [
    { id: 'usr_1', username: 'alex_dev', name: 'Alex Rivera', avatar: '/avatars/alex.png' },
    { id: 'usr_2', username: 'sarah_m', name: 'Sarah Miller', avatar: '/avatars/sarah.png' },
    { id: 'usr_3', username: 'jordan_k', name: 'Jordan Cruz', avatar: bjornAvatar },
    { id: 'user_4', username: 'rees_m', name: 'Rees Mortensen', avatar: reesAvatar }
  ];
  
  // Default user to simulate being logged in during testing
  export const CURRENT_USER = MOCK_USERS[0];