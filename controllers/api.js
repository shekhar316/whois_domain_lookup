const Domain = require("../models/domain")
const tldjs = require('tldjs');
const whois = require('whois')
const XRegExp = require("xregexp");
// const { DATE } = require("sequelize");


exports.fetchWhoIsInfo = async (req, res) => {
    const { url } = req.body;
    const urlData = tldjs.parse(url);
    if (!urlData.isValid) {
        res.json({
            "status": "failure",
            "message": "Invalid Hostname."
        })
    }
    if (!urlData.tldExists) {
        res.json({
            "status": "failure",
            "message": "Unknown TLD."
        })
    }

    const domain = tldjs.getDomain(url);
    const proxyInfo = await Domain.findOne({
        where: {
            "domain": domain
        },
        order: [["updatedAt", "DESC"]]
    })


    if (proxyInfo) {
        res.send({
            "status": "success",
            "url": url,
            "domain": proxyInfo.domain,
            "updated_date": proxyInfo.updated_date,
            "creation_date": proxyInfo.creation_date,
            "expiration_date": proxyInfo.expiration_date,
            "registrar": proxyInfo.registrar,
            "reg_country": proxyInfo.reg_country,
            "whois_data": proxyInfo.whois_data,
            "response_from": "PROXY Server"
        })
    } else {
        whois.lookup(domain, async function (err, data) {
            console.log(data);
            const finalData = parseData(data, domain);
            const newDomain = await Domain.create(finalData);
            finalData["url"] = url;
            finalData["response_from"] = "WHOIS Server";
            finalData["status"] = "success";
            res.json(finalData)
        })
    }






};


function parseData(domainInfo, domain) {

    var parsedData = {
        "domain": domain,
        "updated_date": "",
        "creation_date": "",
        "expiration_date": "",
        "registrar": "",
        "reg_country": "",
        "whois_data": domainInfo
    }

    const updatePatterns = [
        `.*(?<attr>Updated Date:)(?<val>.*)\n`,
        `.*(?<attr>Updated Date:)(?<val>.*)\r\n`,
        `.*(?<attr>Changed:)(?<val>.*)\n`,
        `.*(?<attr>changed:)(?<val>.*)\n`,
        `.*(?<attr>updated:)(?<val>.*)\n`,
        `.*(?<attr>Updated:)(?<val>.*)\n`,
        `.*(?<attr>Last Modified:)(?<val>.*)\n`,
        `.*(?<attr>Last Modified:)(?<val>.*)\r\n`,
        `.*(?<attr>Last update of whois database:)(?<val>.*)<<<\r\n`
    ]

    const createPatterns = [
        `.*(?<attr>Creation Date:)(?<val>.*)\n`,
        `.*(?<attr>Creation Date:)(?<val>.*)\r\n`,
        `.*(?<attr>Registered:)(?<val>.*)\n`,
        `.*(?<attr>Created:)(?<val>.*)\n`,
        `.*(?<attr>created:)(?<val>.*)\n`,
        `.*(?<attr>Activated:)(?<val>.*)\n`,
        `.*(?<attr>activated:)(?<val>.*)\n`
    ]

    const expirePatterns = [
        `.*(?<attr>Expiration Date:)(?<val>.*)\n`,
        `.*(?<attr>Expiration Date:)(?<val>.*)\r\n`,
        `.*(?<attr>Expiry Date:)(?<val>.*)\n`,
        `.*(?<attr>Expires:)(?<val>.*)\n`,
        `.*(?<attr>expires:)(?<val>.*)\n`,
        `.*(?<attr>Expiry Date:)(?<val>.*)\r\n`,

    ]

    const registrarPatterns = [
        `.*(?<attr>Registrar:)(?<val>.*)\n`,
        `.*(?<attr>Registrar:)(?<val>.*)\r\n`,
        `.*(?<attr>Registrant\nHandle:.*\nName:)(?<val>.*)\n`,
        `.*(?<attr>Registrant:)(?<val>.*)\n`,
        `.*(?<attr>Registrant:)(?<val>.*)\r\n`,
        `.*(?<attr>Registrant:\n\t)(?<val>.*)\n`,
        `.*(?<attr>Registrar Name:)(?<val>.*)\n`
    ]

    const countryPatterns = [
        `.*(?<attr>Registrant Country:)(?<val>.*)\n`,
        `.*(?<attr>Registrant Country:)(?<val>.*)\r\n`,
        `.*(?<attr>Country:)(?<val>.*)\n`,
        `.*(?<attr>Registrant:\n\t.*\n\t.*\n\t.*\n\t)(?<val>.*)\n`
    ]

    for (var i = 0; i < updatePatterns.length; i++) {
        var p = XRegExp(updatePatterns[i])
        if (XRegExp.exec(domainInfo, p) && XRegExp.exec(domainInfo, p).groups && XRegExp.exec(domainInfo, p).groups.val) {
            var u_date = XRegExp.exec(domainInfo, p).groups.val;
            if (u_date) {
                parsedData["updated_date"] = new Date(u_date.trim()).toISOString().split('T')[0]
                break;
            }
        }

    }


    for (var i = 0; i < createPatterns.length; i++) {
        var p = XRegExp(createPatterns[i])
        if (XRegExp.exec(domainInfo, p) && XRegExp.exec(domainInfo, p).groups && XRegExp.exec(domainInfo, p).groups.val) {
            var c_date = XRegExp.exec(domainInfo, p).groups.val;
            if (c_date) {
                parsedData["creation_date"] = new Date(c_date.trim()).toISOString().split('T')[0]
                break;
            }
        }

    }

    for (var i = 0; i < expirePatterns.length; i++) {
        var p = XRegExp(expirePatterns[i])
        if (XRegExp.exec(domainInfo, p) && XRegExp.exec(domainInfo, p).groups && XRegExp.exec(domainInfo, p).groups.val) {
            var e_date = XRegExp.exec(domainInfo, p).groups.val;
            if (e_date) {
                parsedData["expiration_date"] = new Date(e_date.trim()).toISOString().split('T')[0]
                break;
            }
        }

    }

    for (var i = 0; i < registrarPatterns.length; i++) {
        var p = XRegExp(registrarPatterns[i])
        if (XRegExp.exec(domainInfo, p) && XRegExp.exec(domainInfo, p).groups && XRegExp.exec(domainInfo, p).groups.val) {
            var registrar = XRegExp.exec(domainInfo, p).groups.val;
            if (registrar) {
                parsedData["registrar"] = registrar.trim()
                break;
            }
        }

    }

    for (var i = 0; i < countryPatterns.length; i++) {
        var p = XRegExp(countryPatterns[i])
        if (XRegExp.exec(domainInfo, p) && XRegExp.exec(domainInfo, p).groups && XRegExp.exec(domainInfo, p).groups.val) {
            var country = XRegExp.exec(domainInfo, p).groups.val;
            if (country) {
                parsedData["reg_country"] = country.trim()
                break;
            }
        }

    }



    return parsedData;
}