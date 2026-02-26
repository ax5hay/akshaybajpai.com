/**
 * Remark plugin: render ```svg code blocks as raw HTML so SVGs display inline.
 */
export function remarkSvgBlock() {
  return (tree) => {
    function visit(node, i, parent) {
      if (node.type === 'code' && node.lang === 'svg' && typeof node.value === 'string') {
        parent.children[i] = { type: 'html', value: `<div class="case-study-diagram">${node.value.trim()}</div>` };
      }
      if (node.children) {
        for (let idx = 0; idx < node.children.length; idx++) {
          visit(node.children[idx], idx, node);
        }
      }
    }
    if (tree.children) {
      for (let i = 0; i < tree.children.length; i++) {
        visit(tree.children[i], i, tree);
      }
    }
  };
}
