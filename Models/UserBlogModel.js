module.exports = (sequelize, DataTypes) => {
    const userblogs = sequelize.define('userblogs', {
        user_blog_id: { type: DataTypes.STRING, unique: true, primaryKey: true },
        title: { type: DataTypes.STRING },
        description: { type: DataTypes.STRING },
        is_deleted: { type: DataTypes.TINYINT, defaultValue: 0 },
        created_by: { type: DataTypes.STRING },
    }, {
        timestamps: true,
    });

    userblogs.associate = function (models) {
        userblogs.belongsTo(models.Users, {
            foreignKey: 'created_by',
            targetKey: 'user_id'
        });
    };

    return userblogs; 
};
