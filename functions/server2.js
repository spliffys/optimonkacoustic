'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require("axios").default;

const router = express.Router();
router.get('/', (req, res) => {
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.write('Optimonk -> Acoustic Webhook is live ');
	res.end();
});

// Set authentication variables in Netlify's environment
const acousticClientID = process.env.acousticClientID;
const acousticClientSecret = process.env.acousticClientSecret;
const acousticRefreshToken = process.env.acousticRefreshToken;
const acousticAPIURL = process.env.ACOUSTIC_WEBHOOK_URL;
const acousticTokenURL = process.env.ACOUSTIC_TOKEN_URL;

/* setting headers to get access token from Acoustic */
var configAccessToken = {
	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
};

const acousticAccessTokenParams = new URLSearchParams({
	"grant_type": "refresh_token",
	"client_id": acousticClientID,
	"client_secret": acousticClientSecret,
	"refresh_token": acousticRefreshToken
});

// will not have front end so don't need to render different routes
//router.get('/another', (req, res) => res.json({ route: req.originalUrl }));

// To display the post body as a response - will not have front end so don't need to render different routes
//router.post('/', (req, res) => res.json({ postBody: req.body }));

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })

// POST /login gets urlencoded bodies
router.post('/', urlencodedParser, function(req, res) {

	// start grabbing values from post
	var email = req.body.email;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var zipcode = req.body.zipcode;
	var campaign_name = req.body.campaign_name;
	var property = req.body.property;
	
	// start removing undefined values
	var lead_source = "";
	var Email_AV_OptIn = "";
	var Email_GAH_OptIn = "";
	var Email_LAFLAG_OptIn = "";
	var Email_LASLC_OptIn = "";
	var Email_SB_OptIn = "";
	var Email_SV_OptIn = "";
	var Email_WGT_OptIn = "";
	
	
	if (Email_AV_OptIn === '' || Email_AV_OptIn === null) {
		var Email_AV_OptIn = "";
	} else if (Email_GAH_OptIn === '' || Email_GAH_OptIn === null) {
		var Email_GAH_OptIn = "";
	} else if (Email_LAFLAG_OptIn === '' || Email_LAFLAG_OptIn === null) {
		var Email_LAFLAG_OptIn = "";
	} else if (Email_LASLC_OptIn === '' || Email_LASLC_OptIn === null) {
		var Email_LASLC_OptIn = "";
	} else if (Email_SB_OptIn === '' || Email_SB_OptIn === null) {
		var Email_SB_OptIn = "";
	} else if (Email_SV_OptIn === '' || Email_SV_OptIn === null) {
		var Email_SV_OptIn = "";
	} else if (Email_WGT_OptIn === '' || Email_WGT_OptIn === null) {
		var Email_WGT_OptIn = "";
	};
	// end removing undefined values
	
	// start setting property specific values for lead source and opt-ins
	if (property === "AV") {
		var Email_AV_OptIn = "Yes";
		var lead_source = "AV Popup to Lead";
		var property_optin_block = `<COLUMN>
			<NAME>Email_AV_OptIn</NAME>
			<VALUE>${Email_AV_OptIn}</VALUE>
		</COLUMN>`;
	} else if (property === "GAH") {
		var Email_GAH_OptIn = "Yes";
		var lead_source = "GAH Popup to Lead";
		var property_optin_block = `<COLUMN>
			<NAME>Email_GAH_OptIn</NAME>
			<VALUE>${Email_GAH_OptIn}</VALUE>
		</COLUMN>`;
	} else if (property === "LAFLAG") {
		var Email_LAFLAG_OptIn = "Yes";
		var lead_source = "LAFLAG Popup to Lead";
		var property_optin_block = `<COLUMN>
			<NAME>Email_LAFLAG_OptIn</NAME>
			<VALUE>${Email_LAFLAG_OptIn}</VALUE>
		</COLUMN>`;
	} else if (property === "LASLC") {
		var Email_LASLC_OptIn = "Yes";
		var lead_source = "LASLC Popup to Lead";
		var property_optin_block = `<COLUMN>
			<NAME>Email_LASLC_OptIn</NAME>
			<VALUE>${Email_LASLC_OptIn}</VALUE>
		</COLUMN>`;
	} else if (property === "SB") {
		var Email_SB_OptIn = "Yes";
		var lead_source = "SB Popup to Lead";
		var property_optin_block = `<COLUMN>
			<NAME>Email_SB_OptIn</NAME>
			<VALUE>${Email_SB_OptIn}</VALUE>
		</COLUMN>`;
	} else if (property === "SV") {
		var Email_SV_OptIn = "Yes";
		var lead_source = "SV Popup to Lead";
		var property_optin_block = `<COLUMN>
			<NAME>Email_SV_OptIn</NAME>
			<VALUE>${Email_SV_OptIn}</VALUE>
		</COLUMN>`;
	} else if (property === "WG") {
		var Email_WGT_OptIn = "Yes";
		var lead_source = "WG Popup to Lead";
		var property_optin_block = `<COLUMN>
			<NAME>Email_WGT_OptIn</NAME>
			<VALUE>${Email_WGT_OptIn}</VALUE>
		</COLUMN>`;
	};
	

	// start our async serverless function
	async function runAcousticToken() {
		try {
			const responseAcousticGenerateAcccessToken = await axios.post(acousticTokenURL, acousticAccessTokenParams, configAccessToken)
				.then((response) => {
					console.info('Response:', response.data);
					var acousticAccessToken = response.data.access_token;
					console.info('Response Token Only:', response.data);
					
					// set up payload
					var xmlBodyAddRecipient = `<Envelope>
					  <Body>
						<AddRecipient>
						  <LIST_ID>2325248</LIST_ID>
						  <CREATED_FROM>2</CREATED_FROM>
						  <UPDATE_IF_FOUND>true</UPDATE_IF_FOUND>
						  <SYNC_FIELDS>
							  <SYNC_FIELD>
								  <NAME>Email</NAME>
								  <VALUE>${email}</VALUE>
							  </SYNC_FIELD>
						  </SYNC_FIELDS>
						  <COLUMN>
							<NAME>Email</NAME>
							<VALUE>${email}</VALUE>
						  </COLUMN>
						  <COLUMN>
							  <NAME>First Name</NAME>
							  <VALUE>${firstname}</VALUE>
						  </COLUMN>
						  <COLUMN>
								<NAME>Last Name</NAME>
								<VALUE>${lastname}</VALUE>
							</COLUMN>
							<COLUMN>
								<NAME>Mailing Zip</NAME>
								<VALUE>${zipcode}</VALUE>
							</COLUMN>
							<COLUMN>
								<NAME>UTM Campaign</NAME>
								<VALUE>${campaign_name}</VALUE>
							</COLUMN>
							<COLUMN>
								<NAME>CRM Lead Source</NAME>
								<VALUE>${lead_source}</VALUE>
							</COLUMN>
							<COLUMN>
								<NAME>Account Name</NAME>
								<VALUE>[not provided]</VALUE>
							</COLUMN>
							<COLUMN>
								<NAME>x1Id</NAME>
								<VALUE>snow</VALUE>
							</COLUMN>
							${property_optin_block}
							<COLUMN>
								<NAME>CRM Enable Sync</NAME>
								<VALUE>Yes</VALUE>
							</COLUMN>
							<COLUMN>
								<NAME>CRM Contact Type</NAME>
								<VALUE>Lead</VALUE>
							</COLUMN>
						</AddRecipient>
					  </Body>
					</Envelope>`;
					
					const acousticAddRecipient = axios.post(acousticAPIURL, xmlBodyAddRecipient, { headers: { 'Content-Type': 'text/xml', 'Authorization': 'Bearer ' + acousticAccessToken }, })
						.then((response) => {
							console.info('response', response.data)
						})
						.catch((error) => {
							alert('error', error.response)
						});
					
					
				})
				.catch((error) => {
					alert('error', error.response)
				});
				
			
			
			
			


		} catch (error) {
			console.info(error);
		}
	}

	runAcousticToken();

	// send response with payload values back to requestor
	res.send('welcome, ' + req.body.firstname + ' ' + req.body.lastname + ' ' + req.body.zipcode + ' ' + req.body.email + ' ' + req.body.campaign_name + ' ' + req.body.property);


});

app.use(bodyParser.json());
app.use('/.netlify/functions/server2', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);