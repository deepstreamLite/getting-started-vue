const Record = {
    template: `
        	<div class="group realtimedb">
                <h2>Realtime Datastore</h2>
                <div class="input-group half left">
                    <label>Firstname</label>
                    <input type="text" v-model="firstname" @input="handleFNameUpdate()" />
                </div>
                <div class="input-group half">
                    <label>Lastname</label>
                    <input type="text" v-model="lastname" @input="handleLNameUpdate()" />
                </div>
            </div>
    `,
    props: ['ds'],
    data: function() {
        return {
            firstname: '',
            lastname: '',
        }
    },
    created: function() {
        this.record = this.ds.record.getRecord('test/johndoe');
        
        this.record.subscribe(values => {
            this.firstname = values.firstname;
            this.lastname = values.lastname;
        })
    },
    methods: {
        handleFNameUpdate: function() {
            this.record.set('firstname', this.firstname);
        },
        handleLNameUpdate: function() {
            this.record.set('lastname', this.lastname);
        }
    }
};

const Events = {
    template: `
        	<div class="group pubsub">
                <div class="half left">
                    <h2>Publish</h2>
                    <button class="half left" id="send-event" @click="handleClick()">Send test-event with</button>
                    <input type="text" class="half" id="event-data" v-model="value"/>
                </div>
                <div class="half">
                    <h2>Subscribe</h2>
                    <ul id="events-received">
                        <template v-for="event in eventsReceived">
                            <li> {{event}} </li>
                        </template>
                    </ul>
                </div>
            </div>
    `,
    props: ['ds'],
    data: function() {
        return {
            eventsReceived: [],
            value: '',
        };
    },
    created: function() {
        this.event = this.ds.event;
        this.event.subscribe('test-event', value => {
            this.eventsReceived.push(value);
        });
    },
    methods: {
        handleClick: function() {
            this.event.emit('test-event', this.value)
        }
    }
};

const RPC = {
    template: `
        	<div class="group reqres">
                <div class="half left">
                    <h2>Request</h2>
                    <button class="half left" @click="handleClick()">Make multiply request</button>
                    <div class="half">
                        <input type="text" v-model="requestValue" class="half left" />
                        <span class="response half item"> {{displayResponse}} </span>
                    </div>
                </div>
                <div class="half">
                    <h2>Response</h2>
                    <div class="half left item">Multiply number with:</div>
                    <input type="text" class="half" v-model="responseValue" />
                </div>
            </div>
    `,
    props: ['ds'],
    data: function() {
        return {
            responseValue: '7',
            requestValue: '3',
            displayResponse: '-'
        }
    },
    created: function() {
        this.rpc = this.ds.rpc;
        this.rpc.provide( 'multiply-number', ( data, response ) => {
		    response.send( data.value * parseFloat(this.responseValue) );
        });
    },
    methods: {
        handleClick: function() {
            const data = {
                value: parseFloat(this.requestValue)
            };
            
            this.rpc.make( 'multiply-number', data, ( err, resp ) => {
                
                this.displayResponse = resp || err.toString();
            });
        }
    }
}

new Vue({
      el: '#app',
      components: {
        'my-record': Record,
        'my-events': Events,
        'my-rpc': RPC
      },
      data: {
        ds: null,
        connectionState: 'INITIAL'
      },
      created: function() {
          this.ds = deepstream('wss://154.deepstreamhub.com?apiKey=97a397bd-ccd2-498f-a520-aacc9f67373c')
          .login()
          .on('connectionStateChanged', connectionState => {
             this.connectionState =  connectionState;
          });
      },
      methods: {
        
      }
})