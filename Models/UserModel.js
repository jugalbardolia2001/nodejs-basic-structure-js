const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
        user_id: { type: DataTypes.STRING, unique: true, primaryKey: true },
        email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true }, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        phno: { type: DataTypes.STRING, allowNull: true },
        referesh_token: { type: DataTypes.TEXT, allowNull: true },
        token_expired_at: { type: DataTypes.DATE, allowNull: true },
        token_revoked: { type: DataTypes.TINYINT, defaultValue: 0, allowNull: true },
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: async (user, options) => {
                user.password = await bcrypt.hash(user.password, 10);
            },
        },
    });

    // Define associations
    Users.associate = function (models) {
        Users.hasMany(models.userblogs, {
            foreignKey: 'created_by',
            targetKey: 'user_id'
        });
    };

    return Users;
};
