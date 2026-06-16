import type { Root } from 'mdast';

/**
 * Remove ```svg code blocks from markdown AST (work case studies).
 */
export function remarkSvgBlock() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function removeSvgBlocks(node: any) {
    if (!node.children) return;
    node.children = node.children.filter((n: { type: string; lang?: string }) => !(n.type === 'code' && n.lang === 'svg'));
    for (const child of node.children) removeSvgBlocks(child);
  }
  return (tree: Root) => {
    removeSvgBlocks(tree);
  };
}
