import type { Metadata } from "next";
import "./showcase.css";

export const metadata: Metadata = {
  title: "Grace & Co. — Project Showcase",
};

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
