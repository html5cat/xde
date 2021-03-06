'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var React = require('react');

var autobind = require('autobind-decorator');
var del = require('del');
var escapeHtml = require('escape-html');
var execAsync = require('exec-async');
var gitInfoAsync = require('git-info-async');
var jsonFile = require('@exponent/json-file');
var os = require('os');
var path = require('path');

var Api = require('../application/Api');
var config = require('../config');
var Commands = require('./Commands');
var Exp = require('../application/Exp');
var FileSystemControls = require('./FileSystemControls');
var LoginPane = require('./LoginPane');
var NewVersionAvailable = require('./NewVersionAvailable');
var StyleConstants = require('./StyleConstants');
var urlUtils = require('../application/urlUtils');
var userSettings = require('../application/userSettings');
var SimulatorControls = require('./SimulatorControls');

var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

function escapeAndPre(s) {
  return escapeHtml(s).replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/ /g, ' ');
}

var App = (function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);
    this.state = {
      packagerController: null,
      packagerLogs: '',
      packagerErrors: '',
      url: null,
      hostType: 'ngrok',
      platform: 'ios',
      dev: true,
      minify: false,
      sendInput: null,
      savedSendToValue: null,
      minify: false,
      recentExps: null,
      urlType: 'exp',
      user: null,
      projectUrl: null
    };

    this._packagerLogsHtml = '';
    this._packagerLogs = '';
    this._packageErrors = '';
    global._App = this;
  }

  _createDecoratedClass(App, [{
    key: '_renderUrl',
    value: function _renderUrl() {

      var style = _Object$assign({}, Styles.url);
      var displayText = this._computeUrl();

      return React.createElement(
        'div',
        { style: {
            marginLeft: 15,
            marginBottom: 0,
            marginRight: 10
          } },
        React.createElement('input', {
          type: 'text',
          ref: 'urlInput',
          controlled: true,
          readOnly: true,
          style: style,
          value: displayText,
          placeholder: 'Waiting for packager and ngrok to start...',
          onClick: this._selectUrl
        }),
        React.createElement('img', {
          src: './Clipboard-21x21.png',
          style: {
            height: 21,
            width: 21,
            margin: 5,
            cursor: 'pointer'
          },
          onClick: this._copyUrlToClipboard
        })
      );
    }
  }, {
    key: '_renderSendInput',
    value: function _renderSendInput() {
      var _this = this;

      return React.createElement(
        'form',
        { onSubmit: function (e) {
            if (_this._isSendToActive()) {
              _this._sendClicked();
            }
            e.preventDefault();
          } },
        React.createElement('input', {
          type: 'text',
          style: _Object$assign({}, Styles.sendInput, {
            marginTop: 2
          }),
          placeholder: 'Phone number or email',
          name: 'sendInput',
          ref: 'sendInput',
          onChange: function (event) {
            // this.setState({value: event.target.value});
            _this.setState({ sendTo: React.findDOMNode(_this.refs.sendInput).value });
          },
          value: this.state.sendTo,
          defaultValue: null
        })
      );
    }
  }, {
    key: '_selectUrl',
    decorators: [autobind],
    value: function _selectUrl() {
      React.findDOMNode(this.refs.urlInput).select();
    }
  }, {
    key: '_copyUrlToClipboard',
    decorators: [autobind],
    value: function _copyUrlToClipboard() {
      this._selectUrl();
      document.execCommand('copy');
      console.log("Copied URL to clipboard");
    }
  }, {
    key: '_renderPackagerConsole',
    value: function _renderPackagerConsole() {

      if (this.state.packagerController) {
        return React.createElement('div', {
          ref: 'packagerLogs',
          key: 'packagerLogs',
          style: _Object$assign({}, Styles.log, {
            overflow: 'scroll'
          }),
          dangerouslySetInnerHTML: { __html: this.state.packagerLogs } });
      } else {
        return this._renderNoPackager();
      }
    }
  }, {
    key: '_renderNoPackager',
    value: function _renderNoPackager() {
      return React.createElement(
        'div',
        { style: {
            display: 'flex',
            alignSelf: 'stretch',
            flexDirection: 'column',
            margin: 'auto'
          } },
        React.createElement(
          'div',
          { style: {
              color: '#bbbbbb',
              fontSize: 17,
              fontWeight: 200,
              fontFamily: ['Helvetica Neue', 'Verdana', 'Arial', 'Sans-serif'],
              flex: 1,
              textAlign: 'center'
            } },
          this.state.recentExps ? React.createElement(
            'div',
            null,
            this.state.recentExps.map(this._renderExp)
          ) : React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              { style: {
                  maxWidth: 460,
                  marginTop: '-15vh',
                  color: '#dddddd'
                } },
              'Use the New Project button to create a new Exponent experience or the Open Project button to open an existing Exponent experience or React Native app'
            )
          )
        )
      );
    }
  }, {
    key: '_renderExp',
    decorators: [autobind],
    value: function _renderExp(exp) {
      var _this2 = this;

      return React.createElement(
        'div',
        {
          onClick: function () {
            _this2._runPackagerAsync({
              root: exp.root
            }, {})['catch'](function (err) {
              _this2._logMetaError("Couldn't open Exp " + exp.name + ": " + err);
            });
          },
          style: {
            borderRadius: 10,
            borderColor: '#eeeeee',
            borderWidth: 0,
            borderStyle: 'solid',
            padding: 8,
            margin: 10,
            maxWidth: 600,
            cursor: 'pointer'
          } },
        React.createElement(
          'div',
          { style: {
              color: 'rgba(0, 59, 107, 0.5)'
            } },
          React.createElement(
            'strong',
            null,
            exp.name
          ),
          ' - ',
          React.createElement(
            'small',
            null,
            exp.description
          )
        ),
        React.createElement(
          'div',
          { style: {
              fontSize: 11
            } },
          exp.readableRoot
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return React.createElement(
        'div',
        { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            alignItems: 'stretch',
            height: '100%'
          } },
        React.createElement(NewVersionAvailable, null),
        React.createElement(
          'div',
          { style: {
              backgroundColor: '#f6f6f6',
              flexShrink: 0,
              flexGrow: 0,
              alignSelf: 'stretch',
              boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
              zIndex: 0
            } },
          React.createElement(
            'div',
            { style: {
                position: 'absolute',
                left: 800
              } },
            React.createElement(LoginPane, {
              packagerController: this.state.packagerController,
              onLogin: function (user) {
                _this3.setState({ user: user });
              },
              onLogout: function () {
                _this3.setState({ user: null });
              }
            })
          ),
          React.createElement(
            'div',
            { style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start'
              } },
            React.createElement('img', { src: './ExponentIcon.png', style: {
                height: 36,
                width: 36,
                marginLeft: 15,
                marginTop: 10,
                cursor: 'pointer'
              }, onClick: function () {
                require('shell').openExternal('http://exponentjs.com/');
              } }),
            this._renderAbout(),
            this._renderButtons()
          ),
          !!this.state.packagerController && React.createElement(
            'div',
            null,
            React.createElement(FileSystemControls, { style: {}, packagerController: this.state.packagerController }),
            this._renderUrl(),
            this._renderUrlOptionButtons(),
            React.createElement(SimulatorControls, { style: {
                marginLeft: 10,
                marginTop: 10
              }, packagerController: this.state.packagerController, dev: this.state.dev, minify: this.state.minify }),
            React.createElement(
              'div',
              { style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: 10,
                  marginLeft: 15,
                  marginBottom: 10
                } },
              this._renderSendLinkButton(),
              React.createElement(
                'span',
                { style: {
                    paddingLeft: 6,
                    paddingRight: 6,
                    paddingTop: 6
                  } },
                'to'
              ),
              this._renderSendInput(),
              this._renderButtonGroupSeparator(),
              this._renderPublishButton()
            ),
            React.createElement(
              'div',
              { style: {
                  marginLeft: 15,
                  marginBottom: 10
                } },
              this._renderPackagerButtonToolbar()
            )
          )
        ),
        this._renderPackagerConsole()
      );
    }
  }, {
    key: '_getProjectName',
    value: function _getProjectName() {
      // TODO: Read the project name
      if (this.state.packagerController) {
        return this.state.packagerController.opts.absolutePath;
      } else {
        return '';
      }
      // if (this.state.user && this.state.packagerController) {
      //   return '@' + this.state.user + '/' + this.state.packagerController.getProjectShortName();
      // } else {
      //   if
      //   return '';
      // }
    }
  }, {
    key: '_renderButtonGroupSeparator',
    value: function _renderButtonGroupSeparator() {
      return React.createElement('span', { 'class': 'btn-separator', style: { width: 70 } });
    }
  }, {
    key: '_renderUrlOptionButtons',
    value: function _renderUrlOptionButtons() {
      var _this4 = this;

      var buttonGroupSpacing = 43;

      return React.createElement(
        'div',
        { style: {
            display: 'flex',
            flexDirection: 'row',
            // justifyContent: 'space-between',
            justifyContent: 'flex-start',
            alignItems: 'space-between',
            width: 1000,
            marginTop: -4,
            marginLeft: 15,
            marginBottom: 10
          } },
        React.createElement(
          ButtonGroup,
          { style: {
              marginRight: buttonGroupSpacing
            } },
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.hostType === 'ngrok' }, { onClick: function (event) {
                _this4.setState({ hostType: 'ngrok' });
                event.target.blur();
              } }),
            'ngrok'
          ),
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.hostType === 'lan' }, { onClick: function (event) {
                _this4.setState({ hostType: 'lan' });
                event.target.blur();
              } }),
            'LAN'
          ),
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.hostType === 'localhost' }, { onClick: function (event) {
                _this4.setState({ hostType: 'localhost' });
                event.target.blur();
              } }),
            'localhost'
          )
        ),
        React.createElement(
          ButtonGroup,
          { style: {
              marginRight: buttonGroupSpacing
            } },
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.platform === 'ios' }, { onClick: function (event) {
                _this4.setState({ platform: 'ios' });
                event.target.blur();
              } }),
            'iOS'
          ),
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.platform === 'android' }, { onClick: function (event) {
                _this4.setState({ platform: 'android' });
                event.target.blur();
              } }),
            'Android'
          )
        ),
        React.createElement(
          ButtonGroup,
          { style: {
              marginRight: buttonGroupSpacing
            } },
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.dev }, { onClick: function (event) {
                _this4.setState({ dev: !_this4.state.dev });
                event.target.blur();
              } }),
            'dev'
          ),
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.minify }, { onClick: function (event) {
                _this4.setState({ minify: !_this4.state.minify });
                event.target.blur();
              } }),
            'minify'
          )
        ),
        React.createElement(
          ButtonGroup,
          null,
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.urlType === 'exp' }, { onClick: function (event) {
                _this4.setState({ urlType: 'exp' });
                event.target.blur();
              } }),
            'exp'
          ),
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.urlType === 'http' }, { onClick: function (event) {
                _this4.setState({ urlType: 'http' });
                event.target.blur();
              } }),
            'http'
          ),
          React.createElement(
            Button,
            _extends({ bsSize: 'small' }, { active: this.state.urlType === 'redirect' }, { onClick: function (event) {
                _this4.setState({ urlType: 'redirect' });
                event.target.blur();
              } }),
            'redirect'
          )
        )
      );
    }
  }, {
    key: '_renderAbout',
    value: function _renderAbout() {
      return React.createElement(
        'div',
        { style: {
            color: '#cccccc',
            fontSize: 11,
            fontFamily: ['Verdana', 'Helvetica Neue', 'Monaco', 'Sans-serif'],
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'flex-end',
            paddingBottom: 10
          } },
        this.state.versionString,
        ' '
      );
    }
  }, {
    key: '_versionStringAsync',
    value: _asyncToGenerator(function* () {
      var pkgJsonFile = jsonFile(path.join(__dirname, '../../package.json'));
      var versionString = yield pkgJsonFile.getAsync('version');
      // console.log('vs =', vs);
      return versionString;
    })
  }, {
    key: '_publishClicked',
    decorators: [autobind],
    value: function _publishClicked() {
      var _this5 = this;

      this._logMetaMessage("Publishing...");

      Exp.getPublishInfoAsync(this.state.env, {
        packagerController: this.state.packagerController,
        username: this.state.user.username
      }).then(function (publishInfo) {
        return Api.callMethodAsync('publish', [publishInfo]).then(function (result) {
          // this._logMetaMessage("Published " + result.packageFullName + " to " + result.expUrl);
          _this5._logMetaMessage("Published to " + result.expUrl);
          console.log("Published", result);
          // TODO: send

          var sendTo = _this5.state.sendTo;
          if (sendTo) {
            console.log("Send link:", result.expUrl, "to", sendTo);
            Commands.sendAsync(sendTo, result.expUrl).then(function () {
              console.log("Sent link to published package");
            }, function (err) {
              console.error("Sending link to published package failed:", err);
            });
          } else {
            console.log("Not sending link because nowhere to send it to.");
          }
        });
      })['catch'](function (err) {
        _this5._logMetaError("Failed to publish package: " + err.message);
      });
    }
  }, {
    key: '_renderPublishButton',
    value: function _renderPublishButton() {
      return React.createElement(
        Button,
        _extends({ bsSize: 'medium' }, { disabled: !this._isPublishActive() }, { onClick: this._publishClicked }),
        'Publish to exp.host'
      );
    }
  }, {
    key: '_isPublishActive',
    value: function _isPublishActive() {
      return !!this.state.packagerController && !!this.state.user;
    }
  }, {
    key: '_renderButtons',
    value: function _renderButtons() {
      return React.createElement(
        ButtonToolbar,
        { style: {
            marginTop: 10,
            marginBottom: 10,
            marginRight: 10,
            marginLeft: 3
          } },
        React.createElement(
          Button,
          { bsSize: 'medium', onClick: this._newClicked },
          'New Project'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', onClick: this._openClicked },
          'Open Project'
        )
      );

      /*
      <Button bsSize='medium' disabled style={{
          background: 'green',
      }}>Packager Active</Button>
      <Button bsSize='medium' active>Button</Button>
      <Button bsStyle='primary' bsSize='medium' active>Primary button</Button>
      <Button bsSize='medium' active>Button</Button>
      */
    }
  }, {
    key: '_isSendToActive',
    value: function _isSendToActive() {
      return !!this.state.packagerController && !!this.state.sendTo;
    }
  }, {
    key: '_renderPackagerButtonToolbar',
    value: function _renderPackagerButtonToolbar() {
      var restartButtonsActive = !!this.state.packagerController;
      var activeProp = {
        // active: restartButtonsActive,
        disabled: !restartButtonsActive
      };

      return React.createElement(
        ButtonToolbar,
        { style: {
            marginBottom: 10
          } },
        React.createElement(
          Button,
          _extends({ style: { marginRight: 5 }, bsSize: 'medium' }, activeProp, { onClick: this._resetPackagerClicked }),
          'Clear Packager Cache'
        ),
        React.createElement(
          Button,
          _extends({ style: { marginRight: 10 }, bsSize: 'medium' }, activeProp, { onClick: this._restartPackagerClicked }),
          'Restart Packager'
        ),
        React.createElement(
          Button,
          _extends({ bsSize: 'medium' }, activeProp, { onClick: this._restartNgrokClicked }),
          'Restart ngrok'
        )
      );
    }
  }, {
    key: '_renderSendLinkButton',
    value: function _renderSendLinkButton() {

      var sendActiveProp = {
        disabled: !this._isSendToActive()
      };

      return React.createElement(
        Button,
        _extends({ bsSize: 'medium' }, sendActiveProp, { onClick: this._sendClicked }),
        'Send Link for Phone'
      );
    }
  }, {
    key: '_newClicked',
    decorators: [autobind],
    value: function _newClicked() {
      var _this6 = this;

      Commands.newExpAsync().then(this._runPackagerAsync, function (err) {
        _this6._logMetaError("Failed to make a new Exp :( " + err);
      });
    }
  }, {
    key: '_openClicked',
    decorators: [autobind],
    value: function _openClicked() {
      var _this7 = this;

      Commands.openExpAsync().then(this._runPackagerAsync, function (err) {
        _this7._logMetaError("Failed to open Exp :( " + err);
      });
    }
  }, {
    key: '_resetPackagerClicked',
    decorators: [autobind],
    value: function _resetPackagerClicked() {
      var _this8 = this;

      console.log("Clearing the packager cache");
      this._logMetaMessage("Clearing the packager cache");
      var cacheGlob = path.join(os.tmpdir(), 'react-packager-cache-*');
      return del(cacheGlob, { force: true }).then(function () {
        return _this8._restartPackagerClicked();
      }, function (error) {
        console.error("Failed to clear the packager cache: " + error.message);
        _this8._logMetaError("Failed to clear the packager cache: " + error.message);
      });
    }
  }, {
    key: '_restartPackagerClicked',
    decorators: [autobind],
    value: function _restartPackagerClicked() {
      var _this9 = this;

      if (this.state.packagerController) {
        console.log("Restarting packager...");
        this._logMetaMessage("Restarting packager...");
        this.state.packagerController.startOrRestartPackagerAsync().then(function () {
          console.log("Packager restarted :)");
        }, function (err) {
          console.error("Failed to restart packager :(");
          _this9._logMetaError("Failed to restart packager :(");
        });
      } else {
        console.error("No packager to restart!");
        this._logMetaError("Packager not running; can't restart it.");
      }
    }
  }, {
    key: '_restartNgrokClicked',
    decorators: [autobind],
    value: function _restartNgrokClicked() {
      var _this10 = this;

      if (this.state.packagerController) {
        console.log("Restarting ngrok...");
        this._logMetaMessage("Restarting ngrok...");
        this.state.packagerController.startOrRestartNgrokAsync().then(function () {
          console.log("ngrok restarted.");
        }, function (err) {
          console.error("Failed to restart ngrok :(");
          _this10._logMetaError("Failed to restart ngrok :(");
        });
      } else {
        console.error("No ngrok to restart!");
        this._logMetaError("ngrok not running; can't restart it.");
      }
    }
  }, {
    key: '_sendClicked',
    decorators: [autobind],
    value: function _sendClicked() {
      var _this11 = this;

      var url_ = this._computeUrl();
      var sendTo = this.state.sendTo;
      console.log("Send link:", url_, "to", sendTo);
      var message = "Sent link " + url_ + " to " + sendTo;
      Commands.sendAsync(sendTo, url_).then(function () {
        _this11._logMetaMessage(message);

        userSettings.updateAsync('sendTo', sendTo)['catch'](function (err) {
          _this11._logMetaWarning("Couldn't save the number or e-mail you sent do");
        });
      }, function (err) {
        _this11._logMetaError("Sending link failed :( " + err);
      });
    }
  }, {
    key: '_appendPackagerLogs',
    decorators: [autobind],
    value: function _appendPackagerLogs(data) {

      // Remove confusing log information
      // let cleanedData = data.replace("│  Keep this packager running while developing on any JS projects. Feel      │", '').replace("│  free to close this tab and run your own packager instance if you          │", '').replace("│  prefer.                                                                   │", '');
      this._packagerLogsHtml = this._packagerLogsHtml + escapeHtml(data);
      this._updatePackagerLogState();
    }
  }, {
    key: '_updatePackagerLogState',
    decorators: [autobind],
    value: function _updatePackagerLogState() {
      this.setState({ packagerLogs: '<pre class="logs">' + this._packagerLogsHtml + '</pre>' });
      this._scrollPackagerLogsToBottom();
    }
  }, {
    key: '_appendPackagerErrors',
    decorators: [autobind],
    value: function _appendPackagerErrors(data) {
      this._packagerLogsHtml += '<span class="log-err">' + escapeHtml(data) + '</span>';
      this._updatePackagerLogState();
    }
  }, {
    key: '_logMetaMessage',
    decorators: [autobind],
    value: function _logMetaMessage(data) {
      this._packagerLogsHtml += '<div class="log-meta">' + escapeHtml(data) + '</div>';
      this._updatePackagerLogState();
    }
  }, {
    key: '_logMetaError',
    decorators: [autobind],
    value: function _logMetaError(data) {
      this._packagerLogsHtml += '<div class="log-meta-error">' + escapeHtml(data) + '</div>';
      this._updatePackagerLogState();
    }
  }, {
    key: '_logMetaWarning',
    decorators: [autobind],
    value: function _logMetaWarning(data) {
      this._packagerLogsHtml += '<div class="log-meta-warning">' + escapeHtml(data) + '</div>';
      this._updatePackagerLogState();
    }
  }, {
    key: '_scrollPackagerLogsToBottom',
    decorators: [autobind],
    value: function _scrollPackagerLogsToBottom() {
      var ta = React.findDOMNode(this.refs.packagerLogs);
      ta.scrollTop = ta.scrollHeight;
    }
  }, {
    key: '_runPackagerAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* (env, args) {
      var _this12 = this;

      this.setState({ env: env });

      if (!env) {
        console.log("Not running packager with empty env");
        return null;
      }

      args = args || {};
      var runPackager = require('../commands/runPackager');
      var pc = yield runPackager.runAsync(env, {});

      this.setState({ packagerReady: false, ngrokReady: false });

      this._packagerController = pc;

      pc.on('stdout', this._appendPackagerLogs);
      pc.on('stderr', this._appendPackagerErrors);
      pc.on('ngrok-ready', function () {
        _this12.setState({ ngrokReady: true });
        // this._maybeRecomputeUrl();
        _this12._logMetaMessage("ngrok ready.");
      });

      pc.on('packager-ready', function () {
        _this12.setState({ packagerReady: true });
        // this._maybeRecomputeUrl();
        _this12._logMetaMessage("Packager ready.");
      });

      this.setState({ packagerController: this._packagerController });

      pc.startAsync();

      return pc;
    })
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this13 = this;

      if (config.__DEV__) {}
      // With the ability to open recent stuff, not much
      // need to auto run the packager anymore.

      // this._runPackagerAsync({
      //   root: '/Users/ccheever/tmp/icecubetray',
      // }).then(() => {
      //   console.log("Successfully loaded icecubetray");
      // }, (err) => {
      //   console.error("Failed to load icecubetray :(", err);
      // });

      // Menu.setupMenu(this);

      // console.log("Getting sendTo");
      userSettings.getAsync('sendTo').then(function (sendTo) {
        _this13.setState({ sendTo: sendTo });
      }, function (err) {
        // Probably means that there's no saved value here; not a huge deal
        // console.error("Error getting sendTo:", err);
      });

      Exp.recentValidExpsAsync().then(function (recentExps) {
        _this13.setState({ recentExps: recentExps });
      }, function (err) {
        console.error("Couldn't get list of recent Exps :(", err);
      });

      this._versionStringAsync().then(function (vs) {
        _this13.setState({ versionString: vs });
      }, function (err) {
        console.error("Couldn't get version string :(", err);
      });

      // gitInfoAsync().then((gitInfo) => {
      //   this.setState({gitInfo});
      // }, (err) => {
      //   console.error("Couldn't get git info :(", err);
      // });
    }
  }, {
    key: '_computeUrl',
    value: function _computeUrl() {

      if (!this.state.packagerController) {
        return null;
      }

      if (this.state.hostType === 'ngrok' && !this.state.packagerController.getNgrokUrl()) {
        return null;
      }

      var opts = {
        http: this.state.urlType === 'http',
        ngrok: this.state.hostType === 'ngrok',
        lan: this.state.hostType === 'lan',
        localhost: this.state.hostType === 'localhost',
        platform: this.state.platform,
        dev: this.state.dev,
        minify: this.state.minify,
        redirect: this.state.urlType === 'redirect'
      };

      return urlUtils.constructUrl(this.state.packagerController, opts);
    }
  }]);

  return App;
})(React.Component);

;

var Styles = {

  log: {
    width: '100%',
    fontFamily: ['Menlo', 'Courier', 'monospace'],
    fontSize: 11,
    paddingLeft: 15,
    paddingRight: 15
  },

  logHeaders: {
    display: 'inline-block',
    width: '100%',
    paddingLeft: 15,
    fontWeight: 'bold',
    fontSize: 13
  },

  url: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    width: 674,
    color: '#888888',
    fontSize: 13,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Sans-serif']
  },

  sendInput: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    width: 250,
    color: '#888888',
    fontSize: 16,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Sans-serif']
  },

  logotype: {
    color: StyleConstants.navy,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Verdana', 'sans-serif'],
    fontSize: 18,
    fontWeight: 200,
    letterSpacing: 4.5,
    lineHeight: 20,
    textTransform: 'uppercase'
  }

};

global.cl = function (a, b, c) {
  console.log(a, b, c);
};

global.ce = function (a, b, c) {
  console.error(a, b, c);
};

module.exports = App;
/*<span style={{fontWeight: '500', fontSize: 15,}}>Recently opened Exps</span>*/ /*
                                                                                 {!!this.state.packagerController && (
                                                                                  <span style={{
                                                                                      color: 'rgba(59, 59, 107, 0.8)',
                                                                                      fontFamily: 'Verdana',
                                                                                      fontWeight: '600',
                                                                                      marginTop: 18,
                                                                                      marginLeft: 8,
                                                                                  }}>{this.state.packagerController.getProjectShortName()}</span>
                                                                                 )} */ /*this.state.gitInfo*/
//# sourceMappingURL=../sourcemaps/web/App.js.map
