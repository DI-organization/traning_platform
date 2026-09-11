import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const { t } = useTranslation("common");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p className="text-5xl font-bold text-muted-foreground">404</p>
      <p className="text-lg font-medium">{t("notFound.title")}</p>
      <Button asChild>
        <Link to="/">{t("notFound.goHome")}</Link>
      </Button>
    </div>
  );
}
