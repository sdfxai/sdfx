export const node_colors = {
    red:      { color: "#322", bgcolor: "#533", groupcolor: "#A88" },
    brown:    { color: "#332922", bgcolor: "#593930", groupcolor: "#b06634" },
    green:    { color: "#232", bgcolor: "#353", groupcolor: "#8A8" },
    blue:     { color: "#223", bgcolor: "#335", groupcolor: "#88A" },
    pale_blue:{ color: "#2a363b", bgcolor: "#3f5159", groupcolor: "#3f789e" },
    cyan:     { color: "#233", bgcolor: "#355", groupcolor: "#8AA" },
    purple:   { color: "#323", bgcolor: "#535", groupcolor: "#a1309b" },
    yellow:   { color: "#432", bgcolor: "#653", groupcolor: "#b58b2a" },
    black:    { color: "#222", bgcolor: "#000", groupcolor: "#444" }
}

export const themes = {
  dark: {
    id: 'dark',
    name: 'Dark (Default)',
    colors: {
      node_slot: {
        CLIP: '#FFD500', // bright yellow
        CLIP_VISION: '#A8DADC', // light blue-gray
        CLIP_VISION_OUTPUT: '#ad7452', // rusty brown-orange
        CONDITIONING: '#FFA931', // vibrant orange-yellow
        CONTROL_NET: '#6EE7B7', // soft mint green
        IMAGE: '#64B5F6', // bright sky blue
        LATENT: '#FF9CF9', // light pink-purple
        MASK: '#81C784', // muted green
        MODEL: '#B39DDB', // light lavender-purple
        STYLE_MODEL: '#C2FFAE', // light green-yellow
        VAE: '#FF6E6E', // bright red
        TAESD: '#DCC274', // cheesecake
      },
      litegraph_base: {
        BACKGROUND_IMAGE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII=',
        CLEAR_BACKGROUND_COLOR: '#18181bcc',
        NODE_TITLE_COLOR: '#a1a1aa',
        NODE_SELECTED_TITLE_COLOR: '#ffffff',
        NODE_TEXT_SIZE: 14,
        NODE_TEXT_COLOR: '#a1a1aa',
        NODE_SUBTEXT_SIZE: 12,
        NODE_DEFAULT_COLOR: '#09090b',
        NODE_DEFAULT_BGCOLOR: '#27272a',
        NODE_DEFAULT_BOXCOLOR: '#a1a1aa',
        NODE_DEFAULT_SHAPE: 'box',
        NODE_BOX_OUTLINE_COLOR: '#54d1db',
        DEFAULT_SHADOW_COLOR: 'rgba(0, 0, 0, 0.75)',
        DEFAULT_GROUP_FONT: 24,

        WIDGET_BGCOLOR: '#09090b50',
        WIDGET_OUTLINE_COLOR: '#09090b',
        WIDGET_TEXT_COLOR: '#71717a',
        WIDGET_SECONDARY_TEXT_COLOR: '#a1a1aa',

        LINK_COLOR: '#a1a1aa',
        EVENT_LINK_COLOR: '#A86',
        CONNECTING_LINK_COLOR: '#87eaf2',
      },
      sdfx_base: {
        'fg-color': '#ffffff',
        'bg-color': '#18181bcc',
        'menu-bg': '#353535',
        'input-bg': '#222',
        'input-text': '#ddd',
        'descrip-text': '#999',
        'drag-text': '#ccc',
        'error-text': '#ff4444',
        'border-color': '#4e4e4e',
        'tr-even-bg-color': '#222',
        'tr-odd-bg-color': '#353535',
      },
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      node_slot: {
        CLIP: '#FFA726', // orange
        CLIP_VISION: '#5C6BC0', // indigo
        CLIP_VISION_OUTPUT: '#8D6E63', // brown
        CONDITIONING: '#EF5350', // red
        CONTROL_NET: '#66BB6A', // green
        IMAGE: '#42A5F5', // blue
        LATENT: '#AB47BC', // purple
        MASK: '#9CCC65', // light green
        MODEL: '#7E57C2', // deep purple
        STYLE_MODEL: '#D4E157', // lime
        VAE: '#FF7043', // deep orange
      },
      litegraph_base: {
        BACKGROUND_IMAGE: 'data:image/gif;base64,R0lGODlhZABkALMAAAAAAP///+vr6+rq6ujo6Ofn5+bm5uXl5d3d3f///wAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAkALAAAAABkAGQAAAT/UMhJq7046827HkcoHkYxjgZhnGG6si5LqnIM0/fL4qwwIMAg0CAsEovBIxKhRDaNy2GUOX0KfVFrssrNdpdaqTeKBX+dZ+jYvEaTf+y4W66mC8PUdrE879f9d2mBeoNLfH+IhYBbhIx2jkiHiomQlGKPl4uZe3CaeZifnnijgkESBqipqqusra6vsLGys62SlZO4t7qbuby7CLa+wqGWxL3Gv3jByMOkjc2lw8vOoNSi0czAncXW3Njdx9Pf48/Z4Kbbx+fQ5evZ4u3k1fKR6cn03vHlp7T9/v8A/8Gbp4+gwXoFryXMB2qgwoMMHyKEqA5fxX322FG8tzBcRnMW/zlulPbRncmQGidKjMjyYsOSKEF2FBlJQMCbOHP6c9iSZs+UnGYCdbnSo1CZI5F64kn0p1KnTH02nSoV3dGTV7FFHVqVq1dtWcMmVQZTbNGu72zqXMuW7danVL+6e4t1bEy6MeueBYLXrNO5Ze36jQtWsOG97wIj1vt3St/DjTEORss4nNq2mDP3e7w4r1bFkSET5hy6s2TRlD2/mSxXtSHQhCunXo26NevCpmvD/UU6tuullzULH76q92zdZG/Ltv1a+W+osI/nRmyc+fRi1Xdbh+68+0vv10dH3+77KD/i6IdnX669/frn5Zsjh4/2PXju8+8bzc9/6fj27LFnX11/+IUnXWl7BJfegm79FyB9JOl3oHgSklefgxAC+FmFGpqHIYcCfkhgfCohSKKJVo044YUMttggiBkmp6KFXw1oII24oYhjiDByaKOOHcp3Y5BD/njikSkO+eBREQAAOw==',
        CLEAR_BACKGROUND_COLOR: '#ffffff',
        NODE_TITLE_COLOR: '#222',
        NODE_SELECTED_TITLE_COLOR: '#000',
        NODE_TEXT_SIZE: 14,
        NODE_TEXT_COLOR: '#444',
        NODE_SUBTEXT_SIZE: 12,
        NODE_DEFAULT_COLOR: '#F7F7F7',
        NODE_DEFAULT_BGCOLOR: '#F5F5F5',
        NODE_DEFAULT_BOXCOLOR: '#CCC',
        NODE_DEFAULT_SHAPE: 'box',
        NODE_BOX_OUTLINE_COLOR: '#000',
        DEFAULT_SHADOW_COLOR: 'rgba(0,0,0,0.1)',
        DEFAULT_GROUP_FONT: 24,

        WIDGET_BGCOLOR: '#ffffff',
        WIDGET_OUTLINE_COLOR: '#e4e4e7',
        WIDGET_TEXT_COLOR: '#27272a',
        WIDGET_SECONDARY_TEXT_COLOR: '#52525b',

        LINK_COLOR: '#4CAF50',
        EVENT_LINK_COLOR: '#FF9800',
        CONNECTING_LINK_COLOR: '#2196F3',
      },
      sdfx_base: {
        'fg-color': '#222',
        'bg-color': '#DDD',
        'menu-bg': '#F5F5F5',
        'input-bg': '#ffffff',
        'input-text': '#222',
        'descrip-text': '#444',
        'drag-text': '#555',
        'error-text': '#F44336',
        'border-color': '#888',
        'tr-even-bg-color': '#f9f9f9',
        'tr-odd-bg-color': '#fff',
      },
    },
  },
}

