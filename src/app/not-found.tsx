import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/brand/Wordmark"
import { t } from "@/i18n/t"

// Branded 404 page using DS components.
// Catch-all for every non-"/" path (static export renders this as 404.html).
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col">
        <div className="mb-6 flex justify-center">
          <Wordmark size="lg" />
        </div>
        <Card className="frost-panel frost-in w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 text-6xl font-bold text-muted-foreground">
              404
            </div>
            <CardTitle>{t("error.notFound")}</CardTitle>
            <CardDescription>{t("error.notFoundDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">{t("error.goHome")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
