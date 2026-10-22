import Script from "next/script";

export function MyWidgetFlowScript() {
  return (
    <Script
      id="mywidgetflow-widget"
      src="https://mywidgetflow.vercel.app/widget.min.js"
      data-widget-id="f3ee50e44cc8"
      strategy="afterInteractive"
    />
  );
}
