let getUserData = (user) => {
        return {
            "id": user['id'],
            "username": user['username'],
            "first_name": user['first_name'],
            "last_name": user['last_name'],
            "avatar": user['avatar'],
        };
};

let getFullName = (user) => `${user['first_name']} ${user['last_name']}`;
module.exports.getUserData = getUserData;
module.exports.getFullName = getFullName;