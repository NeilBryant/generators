var sys = require('sys');

describe('crud', function() {
    var app, compound, output, puts;

    before(function() {
        app = getApp();
        compound = app.compound;
        stubFS();
    });

    after(unstubFS);

    beforeEach(function() {
        output = [];
        puts = sys.puts;
        sys.puts = function(str) {
            output.push(str.replace(/\u001b\[\d+m/g, ''));
        };
    });

    afterEach(function() {
        flushFS();
        sys.puts = puts;
    });

    it('should generate scaffold', function() {
        compound.generators.perform('scaffold', ['post', 'title', 'content']);
        output.should.eql([ 'create  app/',
        'create  app/controllers/',
        'create  app/helpers/',
        'create  app/views/',
        'create  app/views/posts/',
        'create  app/views/layouts',
        'create  test/',
        'create  test/controllers/',
        'create  app/controllers/posts_controller.js',
        'exists  app/',
        'create  app/models/',
        'create  app/models/post.js',
        'create  app/views/layouts/posts_layout.ejs',
        'create  app/views/posts/_form.ejs',
        'create  app/views/posts/show.ejs',
        'create  app/views/posts/new.ejs',
        'create  app/views/posts/edit.ejs',
        'create  app/views/posts/index.ejs',
        'create  app/helpers/posts.js',
        'create  test/controllers/posts_controller.test.js',
        'create  test/init.js']);

        var posts = getFile(app.root + '/app/views/posts/index.ejs');
        posts.should.include('pathTo.edit_post');
        posts.should.include('pathTo.new_post');
        posts.should.not.include('pathTo.edit_posts');
        posts.should.not.include('pathTo.new_posts');

        compound.generators.perform('scaffold', ['users', 'name', 'email']);

        var users = getFile(app.root + '/app/views/users/index.ejs');
        users.should.include('pathTo.edit_user');
        users.should.include('pathTo.new_user');
        users.should.not.include('pathTo.edit_users');
        users.should.not.include('pathTo.new_users');

        var showUser = getFile(app.root + '/app/views/users/show.ejs');
        showUser.should.include('pathTo.users');
        showUser.should.include('pathTo.edit_user(user)');

    });

    it('should generate scaffolding for coffee as well as js');
    it('should generate scaffolding for jade as well as ejs');

    it('should allow "model" as fieldname', function() {
        compound.generators.perform('scaffold', ['users', 'modeltest']);
        var usersform = getFile(app.root + '/app/views/users/_form.ejs')
        usersform.should.include('form.input("modeltest")');
    });

    describe('camelCases should be correctly handled', function(){
        var ctl, mdl, frm, edt, idx, nw, shw;
        var   Model = 'SomeName'
            , Models = 'SomeNames'
            , instance = 'someName'
            , instances = 'someNames'
            , pathInstance = 'somename(someName)'
            , pathInstances = 'somenames'

        it('should accurately handle file names and views', function() {
            compound.generators.perform('scaffold', ['SomeName', 'field']);
            ctl = getFile(app.root + '/app/controllers/somenames_controller.js');
            mdl = getFile(app.root + '/app/models/SomeName.js');
            frm = getFile(app.root + '/app/views/somenames/_form.ejs');
            edt = getFile(app.root + '/app/views/somenames/edit.ejs');
            idx = getFile(app.root + '/app/views/somenames/index.ejs');
            nw  = getFile(app.root + '/app/views/somenames/new.ejs');
            shw = getFile(app.root + '/app/views/somenames/show.ejs');

            output.should.eql([
                'create  app/',
                'create  app/controllers/',
                'create  app/helpers/',
                'create  app/views/',
                'create  app/views/somenames/',
                'create  app/views/layouts',
                'create  test/',
                'create  test/controllers/',
                'create  app/controllers/somenames_controller.js',
                'exists  app/',
                'create  app/models/',
                'create  app/models/SomeName.js',
                'create  app/views/layouts/somenames_layout.ejs',
                'create  app/views/somenames/_form.ejs',
                'create  app/views/somenames/show.ejs',
                'create  app/views/somenames/new.ejs',
                'create  app/views/somenames/edit.ejs',
                'create  app/views/somenames/index.ejs',
                'create  app/helpers/somenames.js',
                'create  test/controllers/somenames_controller.test.js',
                'create  test/init.js'
            ]);

        });
        
        it('should accurately camelize the model', function(){
            mdl.should.include('compound, '+Model);
        });

        describe('should accurately camelize the views', function(){
            it('should accurately camelize the form view', function(){
                //TODO should be instance?
                frm.should.include('errorMessagesFor(somename)');
            })

            it('should accurately camelize the edit view', function(){
                edt.should.include('pathTo.'+pathInstances+'()');
                //TODO: Should be pathInstance
                edt.should.include('pathTo.somename(somename)');
                //TODO Should be instance?
                edt.should.include('formFor(somename,');
            })

            it('should accurately camelize the index view', function(){
                idx.should.include('pathTo.'+pathInstances+'()');
                idx.should.include('somenames.length');
                idx.should.include('somenames.forEach');
                idx.should.include('somename.id');
                //TODO: Should be pathInstance
                idx.should.include('pathTo.somename(somename)');
            })

            it('should accurately camelize the new view', function(){
                nw.should.include('pathTo.'+pathInstances+'()');
                nw.should.include('somename');
                //TODO Should be instance?
                nw.should.include('formFor(somename,');
            })

            it('should accurately camelize the show view', function(){
                shw.should.include('pathTo.'+pathInstances);
                shw.should.include('somename');
                //TODO: Should be pathInstance
                shw.should.include('pathTo.somename(somename)');
            })

        });

        describe('should accurately camelize the controller', function(){

            it('should correctly camelize the before function', function(){
                var fBefore = getFunctionBlock('before', ctl);
                fBefore.should.include('load'+Model);
            })

            it('should correctly camelize the new function', function(){
                var fNew = getFunctionBlock('new', ctl);
                //TODO it should actually be this.someName?
                fNew.should.include('this.'+Model+' = new '+Model);
            })

            it('should correctly camelize the create function', function(){
                var fCreate = getFunctionBlock('create()', ctl);
                fCreate.should.include(Model+'.create');
                fCreate.should.include('body.'+Model);
                fCreate.should.not.include('body.Somename');
                fCreate.should.include('path_to.somenames', 'path_to should be lc plural.');
                fCreate.should.not.include('somename ');
                fCreate.should.not.include('Somename ');
            })

            it('should correctly camelize the index function', function(){
                var fIndex = getFunctionBlock('index()', ctl);
                fIndex.should.include(Model+'.all');
                //TODO should probably be someNames (instances)?
                fIndex.should.include('err, somenames');
                fIndex.should.not.include('Somename');
            })

            it('should correctly camelize the show function', function(){
                var fShow = getFunctionBlock('show()', ctl);
                //TODO Should be instance?
                fShow.should.include('this.'+Model);
                fShow.should.not.include('Somename');
            })

            it('should correctly camelize the edit function', function(){
                var fEdit = getFunctionBlock('edit()', ctl);
                //TODO This should be instance?
                fEdit.should.include('this.'+Model);
                fEdit.should.not.include('Somename');
            })

            it('should correctly camelize the update function', function(){
                var fCreate = getFunctionBlock('update()', ctl);
                //TODO Should be instance = this.instance ?
                fCreate.should.include('var '+Model+' = this.'+Model);
                //TODO Should be instances?
                fCreate.should.include('this.'+Model+'.updateAttributes\(body.'+Model);
                fCreate.should.include('body.SomeName');
                fCreate.should.not.include('body.Somename');
                //TODO This should be pathInstance?
                fCreate.should.include('path_to.SomeName(SomeName)', 'path_to is wrong.');
                fCreate.should.not.include('Somename ');
            })

            it('should correctly camelize the destroy function', function(){
                var fDestroy = getFunctionBlock('destroy()', ctl);
                //TODO should be instance?
                fDestroy.should.include('this.'+Model);
                fDestroy.should.include('path_to.'+pathInstances);
                fDestroy.should.not.include('Somename');
            })

            it('should correctly camelize the loadX function', function(){
                var fLoadX = getFunctionBlock('function load', ctl);
                fLoadX.should.include('SomeName.find');
                //TODO this should be someName?
                fLoadX.should.include('err, SomeName');
                //TODO this should be someName?
                fLoadX.should.include('this.SomeName = SomeName');
                fLoadX.should.not.include('Somename');
            })
        })

        it('should accurately camelize the tests');

    });

    // lcSingle lcPlural liSingle liPlural (lowerCase, lowerInitial)
    // app/controllers/ + lcPlural + _controller.EXT
    // 
    // it ('should correctly handle different cases and pluralities', function() {

    // });

    it('should generate scaffold for jade', function() {
        compound.generators.perform('scaffold', ['-tpl', 'jade', 'post', 'title', 'content']);
        output.should.eql([ 'create  app/',
        'create  app/controllers/',
        'create  app/helpers/',
        'create  app/views/',
        'create  app/views/posts/',
        'create  app/views/layouts',
        'create  test/',
        'create  test/controllers/',
        'create  app/controllers/posts_controller.js',
        'exists  app/',
        'create  app/models/',
        'create  app/models/post.js',
        'create  app/views/layouts/posts_layout.jade',
        'create  app/views/posts/_form.jade',
        'create  app/views/posts/show.jade',
        'create  app/views/posts/new.jade',
        'create  app/views/posts/edit.jade',
        'create  app/views/posts/index.jade',
        'create  app/helpers/posts.js',
        'create  test/controllers/posts_controller.test.js',
        'create  test/init.js']);

    });
});
