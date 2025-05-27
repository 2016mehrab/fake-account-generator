export default function generateRandomProfile() {
  // Helper functions for random data generation
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
  ];
  const streetTypes = ['Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Road', 'Circle', 'Court', 'Place', 'Way'];
  const cities = ['Springfield', 'Riverside', 'Franklin', 'Greenville', 'Bloomington', 'Salem', 'Arlington', 'Madison', 'Clinton', 'Fairview'];

  // Generate random username
  const username = `${getRandomItem(firstNames).toLowerCase()}${getRandomItem(lastNames).toLowerCase()}${Math.floor(Math.random() * 100)}`;

  // Generate random email
  const email = `${username}@${getRandomItem(domains)}`;

  // Generate random password (8-12 characters with letters, numbers, and special chars)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  const passwordLength = Math.floor(Math.random() * 5) + 8;
  let password = '';
  for (let i = 0; i < passwordLength; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  password+='u^U';

  // Generate random phone number (US format: (XXX) XXX-XXXX)
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const phoneNumber = `(${areaCode}) ${prefix}-${lineNumber}`;

  // Generate random date of birth (between 1950 and 2005)
  const year = Math.floor(Math.random() * (2005 - 1950 + 1)) + 1950;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Up to 28 to avoid invalid dates
  const dateOfBirth = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // Generate random address
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetName = `${getRandomItem(firstNames)} ${getRandomItem(streetTypes)}`;
  const streetAddress = `${streetNumber} ${streetName}`;
  const city = getRandomItem(cities);
  const state = getRandomItem(states);
  const zipCode = Math.floor(Math.random() * 90000 + 10000).toString(); // 5-digit ZIP

  const mappedData = {
    username,
    email,
    password,
    phone_number: phoneNumber,
    first_name: getRandomItem(firstNames),
    last_name: getRandomItem(lastNames),
    gender: getRandomItem(['male', 'female']),
    date_of_birth: dateOfBirth,
    address: {
      street_address: streetAddress,
      city,
      state,
      zip_code: zipCode,
      country: 'United States'
    }
  };

  return mappedData;
}