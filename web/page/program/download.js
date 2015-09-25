P = Class.create(P, {

	init: function() {

		this.view.content.className = 'loading';

		this.program = chinachu.util.getProgramById(this.self.query.id);

		this.onNotify = this.refresh.bindAsEventListener(this);
		document.observe('chinachu:recording', this.onNotify);
		document.observe('chinachu:recorded', this.onNotify);

		if (this.program === null) {
			this.modal = new flagrate.Modal({
				title: '番組が見つかりません',
				text : '番組が見つかりません',
				buttons: [
					{
						label: 'ダッシュボード',
						color: '@pink',
						onSelect: function(e, modal) {
							window.location.hash = '!/dashboard/top/';
						}
					}
				]
			}).show();
			return this;
		}

		this.initToolbar();
		this.draw();

		return this;
	}
	,
	deinit: function() {

		if (this.modal) setTimeout(function() { this.modal.close(); }.bind(this), 0);

		document.stopObserving('chinachu:recording', this.onNotify);
		document.stopObserving('chinachu:recorded', this.onNotify);

		return this;
	}
	,
	refresh: function() {
		return this;
	}
	,
	initToolbar: function _initToolbar() {

		var program = this.program;

		this.view.toolbar.add({
			key: 'download',
			ui : new sakura.ui.Button({
				label  : '番組詳細',
				icon   : './icons/film.png',
				onClick: function() {
					window.location.hash = '!/program/view/id=' + program.id + '/';
				}
			})
		});

		return this;
	}
	,
	draw: function() {

		var program = this.program;

		this.view.content.className = 'bg-black';
		this.view.content.update();

		var titleHtml = program.flags.invoke('sub', /.+/, '<span class="flag #{0}">#{0}</span>').join('') + program.title;
		if (typeof program.episode !== 'undefined' && program.episode !== null) {
			titleHtml += '<span class="episode">#' + program.episode + '</span>';
		}
		titleHtml += '<span class="id">#' + program.id + '</span>';

		if (program.isManualReserved) {
			titleHtml = '<span class="flag manual">手動</span>' + titleHtml;
		}

		setTimeout(function() {
			this.view.title.update(titleHtml);
		}.bind(this), 0);

		var saveSettings = function (d) {
			localStorage.setItem('program.download.settings', JSON.stringify(d));
		};

		var set = JSON.parse(localStorage.getItem('program.download.settings') || '{}');

		if (!set.s) {
			set.s = '1280x720';
		}
		if (!set.ext) {
			set.ext = 'm2ts';
		}
		if (!set['b:v']) {
			set['b:v'] = '1M';
		}
		if (!set['c:v']) {
			set['c:v'] = 'copy';
		}
		if (!set['b:a']) {
			set['b:a'] = '96k';
		}
		if (!set['c:a']) {
			set['c:a'] = 'copy';
		}

		var modal = this.modal = new flagrate.Modal({
			disableCloseByMask: true,
			disableCloseButton: true,
			target: this.view.content,
			title : 'ダウンロード',
			buttons: [
				{
					label  : 'ダウンロード',
					color  : '@blue',
					onSelect: function(e, modal) {
						if (this.form.validate() === false) { return; }

						var d = this.d = this.form.result();

						saveSettings(d);

						d.prefix = window.location.protocol + '//' + window.location.host + '/api/recording/' + program.id + '/';
						d.mode = 'download';
						window.open('./api/recorded/' + program.id + '/watch.' + d.ext + '?' + Object.toQueryString(d));

						modal.close();
						window.location.hash = '!/program/view/id=' + program.id + '/';
					}.bind(this)
				}
			]
		}).show();

		if (Prototype.Browser.MobileSafari) {
			modal.buttons[1].disable();
		}

		var exts = [];

		exts.push({
			label     : 'M2TS',
			value     : 'm2ts',
			isSelected: set.ext === 'm2ts'
		});

		exts.push({
			label     : 'MP4',
			value     : 'mp4',
			isSelected: set.ext === 'mp4'
		});

		if (/Trident/.test(navigator.userAgent) === false) {
			exts.push({
				label     : 'WebM',
				value     : 'webm',
				isSelected: set.ext === 'webm'
			});
		}

		this.form = new Hyperform({
			formWidth  : '100%',
			labelWidth : '100px',
			labelAlign : 'right',
			fields     : [
				{
					key  : 'ext',
					label: 'コンテナ',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : exts
					}
				},
				{
					key  : 'c:v',
					label: '映像コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : '無変換',
								value     : 'copy',
								isSelected: set['c:v'] === 'copy'
							},
							{
								label     : 'H.264',
								value     : 'libx264',
								isSelected: set['c:v'] === 'libx264'
							},
							{
								label     : 'MPEG-2',
								value     : 'mpeg2video',
								isSelected: set['c:v'] === 'mpeg2video'
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'm2ts' }
					]
				},
				{
					key  : 'c:v',
					label: '映像コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : 'VP8',
								value     : 'libvpx',
								isSelected: true
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'webm' }
					]
				},
				{
					key  : 'c:v',
					label: '映像コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : 'H.264',
								value     : 'libx264',
								isSelected: true
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'mp4' }
					]
				},
				{
					key  : 'c:v',
					label: '映像コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : 'H.264',
								value     : 'libx264',
								isSelected: true
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'flv' }
					]
				},
				{
					key  : 'c:a',
					label: '音声コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : '無変換',
								value     : 'copy',
								isSelected: set['c:a'] === 'copy'
							},
							{
								label     : 'AAC',
								value     : 'libfdk_aac',
								isSelected: set['c:a'] === 'libfdk_aac'
							},
							{
								label     : 'Vorbis',
								value     : 'libvorbis',
								isSelected: set['c:a'] === 'libvorbis'
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'm2ts' }
					]
				},
				{
					key  : 'c:a',
					label: '音声コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : 'Vorbis',
								value     : 'libvorbis',
								isSelected: true
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'webm' }
					]
				},
				{
					key  : 'c:a',
					label: '音声コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : 'AAC',
								value     : 'libfdk_aac',
								isSelected: true
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'mp4' }
					]
				},
				{
					key  : 'c:a',
					label: '音声コーデック',
					input: {
						type      : 'radio',
						isRequired: true,
						items     : [
							{
								label     : 'AAC',
								value     : 'libfdk_aac',
								isSelected: true
							}
						]
					},
					depends: [
						{ key: 'ext', value: 'flv' }
					]
				},
				{
					key  : 's',
					label: 'サイズ',
					input: {
						type      : 'slider',
						isRequired: true,
						items     : [
							{
								label     : '960x540 (qHD/16:9)',
								value     : '960x540',
								isSelected: set['s'] === '960x540'
							},
							{
								label     : '1024x576 (WSVGA/16:9)',
								value     : '1024x576',
								isSelected: set['s'] === '1024x576'
							},
							{
								label     : '1280x720 (HD/16:9)',
								value     : '1280x720',
								isSelected: set['s'] === '1280x720'
							},
							{
								label     : '1920x1080 (FHD/16:9)',
								value     : '1920x1080',
								isSelected: set['s'] === '1920x1080'
							}
						]
					},
					depends: [
						{ key: 'c:v', value: 'copy', operator: '!==' }
					]
				},
				{
					key  : 'b:v',
					label: '映像ビットレート',
					input: {
						type      : 'slider',
						isRequired: true,
						items     : [
							{
								label     : '256kbps',
								value     : '256k',
								isSelected: set['b:v'] === '256k'
							},
							{
								label     : '512kbps',
								value     : '512k',
								isSelected: set['b:v'] === '512k'
							},
							{
								label     : '1Mbps',
								value     : '1M',
								isSelected: set['b:v'] === '1M'
							},
							{
								label     : '2Mbps',
								value     : '2M',
								isSelected: set['b:v'] === '2M'
							},
							{
								label     : '3Mbps',
								value     : '3M',
								isSelected: set['b:v'] === '3M'
							}
						]
					},
					depends: [
						{ key: 'c:v', value: 'copy', operator: '!==' }
					]
				},
				{
					key  : 'b:a',
					label: '音声ビットレート',
					input: {
						type      : 'slider',
						isRequired: true,
						items     : [
							{
								label     : '32kbps',
								value     : '32k',
								isSelected: set['b:a'] === '32k'
							},
							{
								label     : '64kbps',
								value     : '64k',
								isSelected: set['b:a'] === '64k'
							},
							{
								label     : '96kbps',
								value     : '96k',
								isSelected: set['b:a'] === '96k'
							},
							{
								label     : '128kbps',
								value     : '128k',
								isSelected: set['b:a'] === '128k'
							},
							{
								label     : '192kbps',
								value     : '192k',
								isSelected: set['b:a'] === '192k'
							}
						]
					},
					depends: [
						{ key: 'c:a', value: 'copy', operator: '!==' }
					]
				}
			]
		});

		this.form.render(modal.content);

		return this;
	}
});
