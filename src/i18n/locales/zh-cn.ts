import type { BaseMessage } from '../types';

const zhCn: BaseMessage = {
	settings: {
		groups: {
			general: '常规',
			decoration: '装饰',
			menu: '菜单',
			colors: '颜色',
			emojiMappings: 'Emoji 映射',
			customColorNames: '自定义颜色名称',
			colorCustomization: '颜色自定义',
		},
		enabled: {
			name: '启用多彩高亮',
			desc: '解析带 emoji 前缀的高亮（如 ==🔴文本==）。emoji 决定颜色，并在阅读时保持隐藏。',
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
				underlineWithBg: '下划线',
				rounded: '圆角填充',
				outline: '描边',
				wavyUnderline: '波浪线',
				wavyUnderlineOnly: '仅波浪线',
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
			desc: '彩色高亮背景色的强度（10–100%）。',
		},
		secondaryOpacity: {
			name: '第二层颜色强度',
			desc: '「加深填充」的第二层，以及各种线条的颜色（10–100%）。',
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
			name: '编辑视图中着色',
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
		extendedColors: {
			name: '拓展颜色',
			desc: '启用额外的 5 个颜色槽位（橙色、青色、紫红色、灰色、黑色（剧透）），共十种颜色。你可以切换颜色旁边的开关，只保留自己偏好的颜色。',
		},
		customColorNames: {
			name: '启用自定义颜色名称',
			desc: '为颜色自定义显示名称，赋予它们含义，用来建立适合自己的颜色编码体系。会影响右键菜单、命令等。',
			enabledDesc: '仅显示已启用的颜色。',
		},
		customColorName: {
			desc: '留空时使用颜色名称。',
			placeholder: '显示名称（可选）',
		},
		decorationPage: {
			name: '视图模式渲染选项',
			desc: '配置编辑和阅读时颜色高亮的显示方式。',
		},
		colorSetting: {
			yellow: '为黄色高亮选择自定义颜色。',
			green: '为绿色高亮选择自定义颜色。',
			red: '为红色高亮选择自定义颜色。',
			purple: '为紫色高亮选择自定义颜色。',
			blue: '为蓝色高亮选择自定义颜色。',
			gray: '为灰色高亮选择自定义颜色。',
			orange: '为橙色高亮选择自定义颜色。',
			cyan: '为青色高亮选择自定义颜色。',
			magenta: '为紫红色高亮选择自定义颜色。',
			black: '特殊高亮样式，用来遮挡特定文字的显示，鼠标悬浮后显现文本。',
			toggle: {
				enable: '启用该颜色高亮。',
				disable: '禁用该颜色高亮。',
			},
		},
		colorMappingIntro: '你可以将多种不同的 emoji 映射到特定颜色，全都有效。你不需要使用其中所有 emoji！它们都可以代表对应颜色，但通常你只需要其中第一项，写入时也会使用它。',
		colorMappingDescription: '使用英文逗号分隔多个不同 emoji，任意填写的 emoji 都可以映射到对应颜色。例如你可以用 🍌 作为黄色的符号。在使用插件命令写入高亮时，会使用第一个 emoji 作为写入符号。',
		colorMapping: {
			desc: '写入时使用的 emoji：{{emoji}}',
			emojiPlaceholder: '🔴,🟥',
		},
	},
	colors: {
		yellow: '黄色',
		green: '绿色',
		red: '红色',
		purple: '紫色',
		blue: '蓝色',
		gray: '灰色',
		orange: '橙色',
		cyan: '青色',
		magenta: '紫红色',
		black: '黑色（剧透）',
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
