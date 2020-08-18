/**
 * Implements padLeft in Number.prototype
 * @param {[string, int]} n list of strings or int
 * @param {string} str string to be used as left padding
 * @return {string} padding string. e.g. "002"
 */
Number.prototype.padLeft = function(n, str) {
    return Array(n - String(this).length + 1).join(str || '0') + this;
}


/**
 * Get Timestamp
 * @return {String} current timestamp e.g. "1597691733375"
 **/
function get_timestamp() {
    return Date.now().toString();
}


/**
 * Vue App
 **/
var app = new Vue({
    el: '#content',

    data: {
        city: {
            data: {
                code: "",
                name: "",
                state: "",
                country: ""
            },
            model: "",
            model_autocomplete: [],
            model_autocomplete_hover: 0,
            model_autocomplete_request: null
        },

        forecast: {
            days: {},
            selected_day: '',
            selected_time_index: 0,
            raining_days_text: ''
        },

        loaded: false,
        not_found: false,

        forecast_api_url: '',

    },

    computed: {
        forecast_selected_day: function() {
            return this.forecast.days[this.forecast.selected_day];
        },

        forecast_selected_day_time: function() {
            return this.forecast.days[this.forecast.selected_day][this.forecast.selected_time_index];
        },

        is_ready: function() {
            return this.loaded && !this.not_found;
        }
    },

    methods: {

        forecast_selected_day_time_attr: function(attr_name) {
            return this.forecast.days[this.forecast.selected_day][this.forecast.selected_time_index][attr_name];
        },

        // select the time of current forecast day
        forecast_time_select: function(value) {
            this.forecast.selected_time_index = value;
        },

        // select the forecast day
        forecast_day_select: function(value) {
            this.forecast.selected_day = value;
            this.forecast.selected_time_index = 0;
        },

        city_autocomplete_down: function() {
            if (this.city.model_autocomplete_hover < this.city.model_autocomplete.length - 1) {
                this.city.model_autocomplete_hover += 1;
            }
        },

        city_autocomplete_up: function() {
            if (this.city.model_autocomplete_hover > 0) {
                this.city.model_autocomplete_hover -= 1;
            }
        },

        // city input autocomplete search
        city_autocomplete_search: function(value) {

            // key navigation
            if (value.key == "ArrowDown") {
                // move hover selection down
                this.city_autocomplete_down();

            } else if (value.key == "ArrowUp") {
                // move hover selection up
                this.city_autocomplete_up()

            } else if (value.key == "Enter") {
                // getting focus out of city input
                document.getElementById('focus-out').focus();

            } else if (this.city.model.length >= 3) {

                // cancel unfinished request
                if (this.city.model_autocomplete_request != null) {
                    this.city.model_autocomplete_request.cancel()
                }

                // generate a cancelToken and store it
                this.city.model_autocomplete_request = axios.CancelToken.source();

                axios
                    .get(
                        this.forecast_api_url + 'cities?search=' + this.city.model, { cancelToken: this.city.model_autocomplete_request.token })
                    .then(response => {
                        this.city.model_autocomplete = response.data.results;
                        this.city.model_autocomplete_hover = 0;
                    })
                    .catch(error => console.log(error));
            } else {
                this.city.model_autocomplete = [];
            }
        },

        // select an autocomplete city by its index
        city_autocomplete_select: function(index) {
            if (this.city.model_autocomplete.length) {
                // select city
                this.city.data = this.city.model_autocomplete[index];

                // clear auto complete
                this.city.model_autocomplete = [];

                // update input text
                this.city.model = this.city.data.name;

                // retrieving forecast
                this.get_forecast_data();
            }
        },

        // select the first city of autocomplete
        city_autocomplete_submit: function(value) {
            this.city_autocomplete_select(this.city.model_autocomplete_hover);
        },

        // get forecast from api
        get_forecast_data: async function() {
            this.loaded = false;

            axios
                .get(this.forecast_api_url + 'forecast/next-five-days?city_id=' + this.city.data.code)
                .then(response => {
                    this.forecast.days = response.data.data;

                    if (Object.keys(this.forecast.days).length) {
                        // get first forecast key
                        this.forecast.selected_day = Object.keys(this.forecast.days)[0];

                        // get raining days
                        this.forecast.rain_days_text = response.data.raining_days_text;

                        this.not_found = false;
                    } else {
                        this.not_found = true;
                    }

                    // finish loading
                    this.loaded = true;
                })
                .catch(error => console.log(error));

        }
    },

    filters: {
        to_int(value) {
            return value.toFixed(0);
        },
        get_forecast_attr_default_time(forecast_data, attr_name) {
            // get forecast at 09:00
            if (forecast_data.length >= 4) {
                return forecast_data[3][attr_name];
            }
            // or get the last one
            return forecast_data[forecast_data.length - 1][attr_name];
        },
        datetime_to_time(value) {
            let dt = new Date(value);
            return dt.getHours().padLeft(2) + ":" + dt.getMinutes().padLeft(2)
        }
    },

    async mounted() {
        // setting up env vars
        await axios
            .get('/env.json?' + get_timestamp())
            .then(response => {
                this.forecast_api_url = response.data.forecast_api_url;
                this.city.data = response.data.city_default_data;
            })
            .catch(error => console.log(error));

        // setting up input text display
        this.city.model = this.city.data.name;

        // retrieving forecast
        this.get_forecast_data();
    }
});