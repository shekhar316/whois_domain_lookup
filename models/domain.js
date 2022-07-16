const Sequelize = require("sequelize");
const sequelize = require("../utils/db");

const Domain = sequelize.define("domain", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    domain: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    updated_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
    },
    creation_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
    },
    expiration_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
    },
    registrar: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    reg_country: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    whois_data: {
        type: Sequelize.TEXT("long"),
        allowNull: true
    }
});

module.exports = Domain;