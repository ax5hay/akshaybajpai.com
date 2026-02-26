/**
 * Remark plugin: remove ```svg code blocks so case studies show only written content.
 */
export function remarkSvgBlock() {
  function removeSvgBlocks(node) {
    if (!node.children) return;
    node.children = node.children.filter((n) => !(n.type === 'code' && n.lang === 'svg'));
    node.children.forEach(removeSvgBlocks);
  }
  return (tree) => {
    removeSvgBlocks(tree);
  };
}
