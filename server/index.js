/**
 * Copyright (c) 2016 OffGrid Networks. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const iopa = require('iopa'),
    _ = require('iopa-connect'),
    static = require('iopa-static'),
    templates = require('iopa-templates'),
    handlebars = require('iopa-template-handlebars'),
    router = require('iopa-router'),
    http = require('http');

var app = new iopa.App();

app.use(templates);

app.use(router);

app.engine('.hbs', handlebars({
    defaultLayout: 'main', 
    views: 'views'
 }));
    
app.use(static(app, './renderer'));

app.get('/', function (context) {
   return context.render('home', {data: {appname: 'NodeKit'}});
});

var port = process.env.PORT || 3000;
http.createServer(app.buildHttp()).listen(port);
console.log('listening at:', port);
