/** Runs synchronously at body open — marks iframe context without touching <html> (React-owned) */
export function EmbeddedDetectScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{if(window.self!==window.top){document.body.classList.add('embedded');}}catch(e){document.body.classList.add('embedded');}})();`,
      }}
    />
  );
}
