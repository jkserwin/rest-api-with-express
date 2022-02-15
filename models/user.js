'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A first name is required'
                },
                notEmpty: {
                    msg: 'Please provide a first name'
                }
            },
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A last name is required'
                },
                notEmpty: {
                    msg: 'Please provide a last name'
                }
            },
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: {
                msg: 'That email address is already associated with another user'
            },
            validate: {
                notNull: {
                    msg: 'An email address is required'
                },
                notEmpty: {
                    msg: 'Please provide an email address'
                }
            },
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            set(val) {
                const hashedPassword = bcrypt.hashSync(val, 10);
                this.setDataValue('password', hashedPassword);
            },
            validate: {
                notNull: {
                    msg: 'A password is required'
                },
                notEmpty: {
                    msg: 'Please provide a password'
                }
            },
        }
    }, { sequelize });

    User.associate = (models) => {
        User.hasMany(models.Course, {
            foreignKey: {
                allowNull: false,
            },
        });
    };

    return User;
}