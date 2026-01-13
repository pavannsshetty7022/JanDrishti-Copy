const bcrypt = require('bcryptjs');



const newAdminPassword = 'Pk@7022302564'; 

const saltRounds = 10;



bcrypt.hash(newAdminPassword, saltRounds, (err, hash) => {

    if (err) {

        console.error('Error hashing password:', err);

        return;

    }

    console.log('New Admin Username: pavannsshetty'); 

    console.log('Hashed Password:', hash);

});