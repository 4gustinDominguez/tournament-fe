import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("Contact");

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32 bg-night-900 relative overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] w-[45%] h-[60%] bg-amber-500/15 rounded-full blur-[120px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
            {t("title")}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-night-200 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="shadow-card border-border bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl font-bold text-foreground">
                  {t("form.title")}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t("form.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {t("form.firstName")}
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t("form.firstNamePlaceholder")}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {t("form.lastName")}
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t("form.lastNamePlaceholder")}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("form.email")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("form.emailPlaceholder")}
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("form.subject")}
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder={t("form.subjectPlaceholder")}
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("form.message")}
                  </label>
                  <textarea
                    id="message"
                    placeholder={t("form.messagePlaceholder")}
                    rows={6}
                    className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-lg shadow-card hover:scale-[1.02] transition-all"
                >
                  {t("form.send")}
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                  {t("info.title")}
                </h2>
                <p className="text-muted-foreground mb-8">{t("info.description")}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Mail className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">
                      {t("info.email.title")}
                    </h3>
                    <p className="text-muted-foreground">{t("info.email.value")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Phone className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">
                      {t("info.phone.title")}
                    </h3>
                    <p className="text-muted-foreground">{t("info.phone.value")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sky-50 rounded-lg">
                    <MapPin className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">
                      {t("info.address.title")}
                    </h3>
                    <p className="text-muted-foreground">{t("info.address.value")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-100 rounded-lg">
                    <Clock className="h-6 w-6 text-neutral-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">
                      {t("info.hours.title")}
                    </h3>
                    <p className="text-muted-foreground">{t("info.hours.value")}</p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <Card className="shadow-card border-border bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle className="font-display text-xl font-bold text-foreground">
                    {t("faq.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      {t("faq.q1")}
                    </h4>
                    <p className="text-muted-foreground text-sm">{t("faq.a1")}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      {t("faq.q2")}
                    </h4>
                    <p className="text-muted-foreground text-sm">{t("faq.a2")}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      {t("faq.q3")}
                    </h4>
                    <p className="text-muted-foreground text-sm">{t("faq.a3")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
