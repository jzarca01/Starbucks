const _ = require('lodash');
const Axios = require('axios');
const QueryString = require('querystring');
const Moment = require('moment');
const faker = require('faker');

const signature = require('./signature');
const zipcodes = require('./france.json');


class Client {

    constructor(api_key, client_id, client_secret, access_token) {
        this.api_key = api_key;
        this.client_id = client_id;
        this.client_secret = client_secret;

        this.access_token = access_token;

        this._httpClient = Axios.create({
            baseURL: 'https://openapi.starbucks.com/v1/'
        });
        //axiosDebug(this._httpClient);

    }

    authenticate(username, password) {
        const sig = signature(this.client_id, this.client_secret, Moment().unix());

        const url = 'oauth/token?' + QueryString.stringify({
            sig: sig,
            platform: 'Android'
        });

        const params = QueryString.stringify({
            grant_type: "password",
            client_id: this.client_id,
            client_secret: this.client_secret,
            username: username,
            password: password,
            timestamp: this._now
        }) + "\r\n";

        return this._httpClient({
            method: 'POST',
            headers: {
                'X-Api-Key': this.client_id,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url: url,
            data: params
        }).then(response => {
            const access_token_key = 'access_token';
            const result = _.pick(response.data, access_token_key)
            this.access_token = _.get(result, access_token_key, this.access_token);
            return result;
        });
    }

    initialize() {
        const sig = signature(this.client_id, this.client_secret, Moment().unix());

        const url = 'native-app/initialize?' + QueryString.stringify({
            sig: sig,
            api_key: this.api_key
        });

        return this._httpClient({
            method: 'POST',
            headers: {
                'X-Api-Key': this.client_id,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url: url
        });
    }

    signup(username, password) {
        const sig = signature(this.client_id, this.client_secret, Moment().unix());

        const new_zipcodes = zipcodes.filter(
            zipcode => zipcode['Code_postal'].toString().length === 5
        );
        const randomCity =
            new_zipcodes[Math.floor(Math.random() * new_zipcodes.length)];

        const url = 'account/create?' + QueryString.stringify({
            market: 'FR',
            access_token: this.access_token,
            platform: "Android"
        });

        return this._httpClient({
                method: 'POST',
                headers: {
                    'X-Api-Key': this.client_id,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                url: url,
                data: {
                    "addressLine1": faker.fake('{{address.streetAddress}}'),
                    "addressLine2": "",
                    "birthDay": parseInt(birthDay),
                    "birthMonth": parseInt(birthMonth),
                    "city": JSON.stringify(randomCity.Nom_commune).replace(/"/g, ''),
                    "country": "FR",
                    "countrySubdivision": "Android",
                    "emailAddress": username,
                    "firstName": faker.fake('{{name.firstName}}'),
                    "lastName": faker.fake('{{name.lastName}}'),
                    "market": "FR",
                    "password": password,
                    "postalCode": JSON.stringify(randomCity.Code_postal),
                    "receiveGeneralEmailCommunications": true,
                    "receivePersonalizedEmailCommunications": true,
                    "registrationSource": "Android",
                    "reputation": {
                        "deviceFingerprint": "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",
                        "ipAddress": "1.2.3.4"
                    }
                }
            }).then(response => {
                const access_token_key = 'access_token';
                const result = _.pick(response.data, access_token_key)
                this.access_token = _.get(result, access_token_key, this.access_token);
                return result;
            })
            .catch(err => console.log(err))
    }

    _authenticatedRequest(params) {
        const options = _.merge({}, params, {
            headers: {
                Authorization: `Bearer ${this.access_token}`,
                Accept: 'application/json; charset=UTF-8',
                'User-Agent': 'Starbucks Android 4.3.9',
            }
        });
        return this._httpClient(options);
    }

    getNearbyStores(latitude, longitude, radius, limit) {
        const url = 'stores/nearby?' + QueryString.stringify({
            limit: limit,
            latlng: latitude + "," + longitude,
            radius: radius,
            offset: 0,
            ignore: 'regularHours,timeZoneInfo,extendedHours,brandName,ownershipTypeCode,operatingStatus,regulations,serviceTime,xopState,currency,address.countrySubdivisionCode,hoursNext7Days.holidayCode',
            access_token: this.access_token
        });
        return this._httpClient({
            method: 'GET',
            url: url
        }).then(response => {
            let stores = _.get(response, 'data.stores');
            stores = _.map(stores, o => _.pick(_.get(o, 'store', {}), ['id', 'name', 'storeNumber', 'phoneNumber', 'coordinates', 'hoursNext7Days', 'address']));
            return stores;
        });
    }

    getProfile() {
        const url = 'me/profile?access_token=' + this.access_token + '&ignore=tippingPreferences%2Cdevices%2CfavoriteStores';

        return this._httpClient({
            method: 'GET',
            url: url
        }).then(response => {
            let starbucksCards = _.get(response, 'data.starbucksCards');
            starbucksCards = _.map(starbucksCards, o => _.pick(o, ['cardId', 'cardNumber', 'nickname', 'class', 'type', 'balanceCurrencyCode', 'submarketCode', 'balance', 'balanceDate', 'primary', 'partner', 'autoReloadProfile', 'digital', 'owner']));
            return starbucksCards;
        });
    }

    getCurrentBalance(cardNumber) {
        const url = 'me/cards/' + cardNumber + '/balance' + QueryString.stringify({
            access_token: this.access_token
        });
        return this._httpClient({
            method: 'GET',
            url: url
        }).then(response => {
            let card = _.get(response, 'data');
            DEBUG
            console.log(card[balance]);
            return card[balance];
        });
    }

    cards() {
        return this._authenticatedRequest({
            method: 'get',
            url: 'me/cards'
        }).then(response => {
            const cards = response.data;
            return _.map(cards, o => _.pick(o, ['name', 'cardId', 'cardNumber', 'nickname', 'balance']));
        });
    }

    last_order() {
        const params = {
            market: 'US',
            locale: 'en-US',
            limit: 1,
            offset: 0
        };
        return this._authenticatedRequest({
            url: 'me/orders',
            method: 'get',
            params: params
        }).then(response => {
            return _.get(response, 'data.orderHistoryItems.0.basket');
        });
    }

    convert_order_to_cart(order) {
        let preparation = _.get(order, 'preparation');
        let items = _.get(order, 'items', []);
        items = _.map(items, it => _.pick(it, ['quantity', 'commerce.sku']));
        if (preparation) {
            return {
                cart: {
                    offers: [],
                    items: items
                },
                delivery: {
                    deliveryType: preparation
                }
            }
        } else {
            return {
                cart: {
                    offers: [],
                    items: items
                }
            };
        }
    }

    price_order(store, cart) {
        const params = cart;
        return this._authenticatedRequest({
            method: 'post',
            url: `me/stores/${store}/priceOrder?` + QueryString.stringify({
                market: 'US',
                locale: 'en-US',
                serviceTime: true
            }),
            data: cart
        }).then(response => {
            const data = _.get(response, 'data');
            return _.pick(data, ['orderToken', 'summary.totalAmount', 'store.storeNumber', 'signature']);
        });
    }

    place_order(details, card_id) {
        const params = {
            signature: details.signature,
            tenders: [{
                amountToCharge: details.summary.totalAmount,
                type: "SVC",
                id: card_id
            }]
        };
        return this._authenticatedRequest({
            method: 'post',
            url: `me/stores/${details.store.storeNumber}/orderToken/${details.orderToken}/submitOrder?` + QueryString.stringify({
                market: 'US',
                locale: 'en-US'
            }),
            data: params
        }).then(response => {
            return _.get(response, 'data');
        });
    }
}

module.exports = Client;