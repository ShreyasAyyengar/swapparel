import { createSerializer, parseAsString } from "nuqs";

const serializeProfile = createSerializer({
  email: parseAsString,
});

export default function sendToProfilePage(email: string, router: { push: (url: string) => void }) {
  router.push(`/profile${serializeProfile({ email })}`);
}
