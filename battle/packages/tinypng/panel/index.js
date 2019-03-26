var utils = require(Editor.url('packages://tinypng/utils/utils'));
var CfgUtil = Editor.require('packages://tinypng/utils/CfgUtil.js');
var FileUtil = Editor.require('packages://tinypng/utils/FileUtil.js');
var child_process = require("child_process");

Editor.Panel.extend({
  // css style for panel
  style: `

  `,

  // html template for panel
  //  <ui-button id="tinypng" v-on:confirm="startCompression_p">${Editor.T('tinypng.start_tinypng')}</ui-button>
  template: `
    <head>
      <hr/>
      <ui-prop name="${Editor.T('tinypng.proj')}">
          <ui-select id="proj" v-on:confirm="selectProject">
          <option value="web-mobile">web-mobile</option>
          <option value="web-desktop">web-desktop</option>
          <option value="wechatgame">wechatgame</option>
          <option value="jsb-default">jsb-default</option>
          <option value="jsb-binary">jsb-binary</option>
          <option value="jsb-link">jsb-link</option>
          </ui-select>
      </ui-prop>
      <ui-prop name="压缩进度">
          <ui-progress style="width: 90%;" v-value="progress">0</ui-progress>
      </ui-prop>
      <ui-prop name="发布进度">
          <ui-progress style="width: 90%;" v-value="progressBuild">0</ui-progress>
      </ui-prop>
      <ui-prop name="忽略文件夹">
          <ui-input v-value="skipFiles" v-on:change="setSkipFiles"</ui-input>
      </ui-prop>
      <ui-prop name="tinify key">
          <ui-input v-value="key" v-on:change="changeKey"</ui-input>
      </ui-prop>
      <ui-prop name="">
          <ui-button id="tinify" v-on:confirm="startCompression_t">${Editor.T('tinypng.start_tinify')}</ui-button>
		  <!-<ui-button id="uploadfiles" v-on:confirm="upload_build_res">uploadFiles</ui-button>->
      </ui-prop>
      <hr/>
        <div style="overflow:scroll;height:100%">
            <div v-for="item of list" id="item">
                <div class="info">
                    <img src="" v-bind:src="item.path" alt="" width="50" height="50">
                    <span>
                        {{item.name}}
                    </span>
                    <span>
                      {{item.before_size}}B
                    </span
                </div>
            </div>
        </div>
    </head>
  `,

  dependencies: [
    'packages://tinypng/lib/jquery.min.js',
    "packages://tinypng/lib/vendor.bundle.js",
  ],

  // element and variable binding
  $: {

  },

  // method executed when template and styles are successfully loaded and initialized
  ready() {

    this.vue = new window.Vue({
      el: this.shadowRoot,
      created: function () {
        let self = this;
        CfgUtil.initCfg(function (data) {
          if (data) {
            self.key = data.key;
            self.skipFiles = data.skipFiles;
            utils.skipFiles = self.skipFiles;
            utils.project = self.project;
          } else {
            self._saveConfig();
          }
        });
      },
      data: {
        list: [],
        project: 'web-mobile',

        key: '',
        skipFiles: '',
        progress: 0,
        progressBuild: 0,
      },

      methods: {
        upload_build_res() {
          if (this.progressBuild <= 100) {
            Editor.log("creator build is not finished : " + this.progressBuild);
            return;
          }
          var exec = require('child_process').exec;

          var url = Editor.url('packages:tinypng');
          var arg1 = '39.106.192.188';

          var arg3 = url + '//res';
          var arg4 = '/home/dev/test/res';

          var filename = url + '\\connect.py'
          var rsa = url + '\\penglong'
          exec('python' + ' ' + filename + ' ' + arg1 + ' ' + rsa + ' ' + arg3 + ' ' + arg4, function (error, stdout, stderr) {
            if (stdout.length > 1) {
              Editor.log('you offer args:', stdout);
            } else {
              Editor.log('you don\'t offer args');
            }
            if (error) {
              Editor.error('error stderr : ' + error);
            }
          });
        },
        _saveConfig() {
          let data = {
            key: this.key,
            skipFiles: utils.skipFiles,
          };
          CfgUtil.saveConfig(data);
        },
        setSkipFiles(event) {
          this.skipFiles = event.value;
          utils.skipFiles = this.skipFiles;
          this._saveConfig();
        },
        changeKey(event) {
          this.key = event.value;
          this._saveConfig();
        },
        selectProject(event) {
          this.list = [];
          this.project = event.target.value;
          utils.project = this.project;
        },

        buildFinished() {
          Editor.log('buildFinished');
          utils.revertRes();
          this.progressBuild = 100;
        },

        compressionPngFinished() {
          // 压缩完成，替换压缩资源
          utils.replaceCompressionRes();
          this.progress = 100;
          let itv = setInterval(() => {
            if (this.progressBuild >= 90) clearInterval(itv);
            this.progressBuild++;
          }, 1000);

          // 开始编译项目
          // let cmd = 'CocosCreator.exe --path '
          //   + `${Editor.projectInfo.path}`
          //   + ' --build "platform='
          //   + this.project + '"';
          // Editor.log('start build project cmd = ' + cmd);
          // child_process.exec(cmd, { timeout: 3654321 }, (error, stdout, stderr) => {
          //   if (stderr) {
          //     Editor.error("creator build error : " + stderr);
          //     //return;
          //   } else {
          //     this.buildFinished();
          //   }
          // });
          this.buildFinished();
        },

        startCompression_t() {
          utils.backResUp();
          this.list = utils.getCompressionFiles();
          if (this.list && this.list.length > 0) {
            this.compressionPng_t();
          } else {
            setTimeout(() => {
              this.compressionPngFinished();
            }, 1000);
          }
        },

        compressionPng_t() {
          let self = this;
          Editor.success("tinify start!")

          let index = 0;
          let key = this.key;
          let cmd = Editor.url('packages://tinypng/tool/png.py');
          let item = this.list[index];
          let exe_cmd = cmd + ' ' + key
            + ' ' + item.resPath
            + ' ' + item.output;
          Editor.log("tinify : " + exe_cmd);

          self.progress = 0;
          self.progressBuild = 0;

          function exec() {
            child_process.exec(exe_cmd, { timeout: 3654321 }, function (error, stdout, stderr) {
              if (stderr) {
                Editor.error("tinify error : " + stderr);
                //return;
              }
              if (index < self.list.length - 1) {

                index++;
                item = self.list[index];
                exe_cmd = cmd + ' ' + key
                  + ' ' + item.resPath
                  + ' ' + item.output;
                Editor.log("tinify : " + exe_cmd);
                self.progress = parseInt(index / self.list.length * 100);
                exec();
              } else {
                Editor.success("tinify finished!");
                self.compressionPngFinished();
              }
            })
          }
          exec();
        },

      }
    })
  },

  // register your ipc messages here
  messages: {

  }
});
