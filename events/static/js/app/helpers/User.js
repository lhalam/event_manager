let getUserData = (user) => {
        return {
            "id": user['id'],
            "username": user['username'],
            "first_name": user['first_name'],
            "last_name": user['last_name'],
            "avatar": user['avatar'],
            "key": user['key'],
            "url": user['url'],
        };
};

let getFullName = (user) => `${user['first_name']} ${user['last_name']}`;
const defaultProfilePicture = 'default_photo.jpg';

module.exports.getUserData = getUserData;
module.exports.getFullName = getFullName;
module.exports.defaultProfilePicture = defaultProfilePicture;
