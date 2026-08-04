import type { BaseMessage } from '../types';

const zhCn: BaseMessage = {
	settings: {
		groups: {
			general: '常规',
			decoration: '装饰',
			colors: '颜色',
			emojiMappings: 'Emoji 映射',
		},
		enabled: {
			name: '启用多彩高亮',
			desc: '解析带 emoji 前缀的高亮（如 ==🟥文本==）。emoji 决定颜色，并在阅读时保持隐藏。',
		},
		highlightStyle: {
			name: '高亮样式',
			desc: '应用于编辑器和阅读视图中所有高亮的视觉样式。',
			preview: '示例文本',
			options: {
				default: '默认',
				halfStrike: '半填充',
				doubleStrike: '加深填充',
				underlineOnly: '仅下划线',
				underlineWithBg: '下划线加背景',
				rounded: '圆角填充',
				outline: '描边',
				wavyUnderline: '波浪下划线',
				gradient: '渐变填充',
			},
		},
		defaultColor: {
			name: '默认高亮颜色',
			desc: '没有 emoji 前缀的普通 ==高亮== 使用的颜色。将高亮切换到此颜色时会移除其 emoji 前缀。',
			none: '无（主题默认）',
		},
		opacity: {
			name: '颜色强度',
			desc: '彩色高亮背景色的混合百分比（10–100%）。',
		},
		renderMode: {
			name: '着色方式',
			desc: '「插件样式」由插件直接绘制配置的背景；「主题原生」只为高亮覆盖 --text-highlight-bg 变量，交由主题绘制。',
			options: {
				plugin: '插件样式',
				native: '主题原生',
			},
		},

		editorMenu: {
			name: '编辑器右键菜单颜色操作',
			desc: '在选中文字或已有高亮上右键时，显示高亮颜色操作。',
		},
		submenu: {
			name: '收纳为二级菜单',
			desc: '将颜色操作收纳到右键菜单中的单个菜单项下。',
		},
		editorDecorator: {
			name: '编辑器中着色',
			desc: '在实时预览和源码模式中为 emoji 高亮着色。编辑文本时会临时显示 emoji。',
		},
		showPrefixInSource: {
			name: '源码模式显示 emoji',
			desc: '开启编辑器着色后，在源码模式中保留 emoji 前缀可见。',
		},
		readingRenderer: {
			name: '阅读视图中着色',
			desc: '在阅读视图中为高亮着色，并从渲染文本中隐藏匹配的 emoji 前缀。',
		},
		colorSetting: {
			desc: '用于标记 {{emoji}} 的高亮。',
		},
		emojiMappingIntro: '每种颜色对应一组逗号分隔的 emoji 别名。应用颜色时写入第一个 emoji。',
		emojiMapping: {
			desc: '回写 emoji：{{emoji}}（列表第一项）',
			placeholder: '🟥,🔴',
		},
	},
	colors: {
		yellow: '黄色',
		green: '绿色',
		red: '红色',
		purple: '紫色',
		blue: '蓝色',
	},
	commands: {
		toggle: '切换高亮',
		remove: '移除高亮',
		setColor: '高亮为{{color}}',
	},
	menu: {
		highlightColor: '高亮颜色',
		removeHighlight: '移除高亮',
	},
};

export default zhCn;
