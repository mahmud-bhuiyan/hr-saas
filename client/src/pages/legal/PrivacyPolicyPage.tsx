import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants/app';
import { LEGAL_LAST_UPDATED, PRIVACY_CONTACT_EMAIL } from './constants';
import { LegalPageLayout, LegalSection } from './components/LegalPageLayout';

export const PrivacyPolicyPage = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LEGAL_LAST_UPDATED}>
      <p className="text-sm leading-relaxed text-slate-600">
        This Privacy Policy explains how Daily HR (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
        collects, uses, discloses, and protects personal information when you visit our websites,
        use the {APP_NAME} platform (the &quot;Service&quot;), or otherwise interact with us. It also
        describes your privacy rights and choices.
      </p>

      <LegalSection id="roles" title="1. Roles and scope">
        <p>
          For account and billing data relating to customer organizations and their administrators,
          Daily HR generally acts as a <strong className="font-medium text-slate-700">data controller</strong>.
        </p>
        <p>
          For employee, contractor, and workforce data that a customer uploads or generates through
          the Service, the customer organization is typically the{' '}
          <strong className="font-medium text-slate-700">data controller</strong> and Daily HR acts
          as a <strong className="font-medium text-slate-700">data processor</strong>, processing
          that information on the customer&apos;s instructions to provide the Service. Customers are
          responsible for their own workforce privacy notices and lawful bases for processing.
        </p>
        <p>
          This Policy applies to the Service and related websites. It does not cover third-party
          websites or services linked from the Service.
        </p>
      </LegalSection>

      <LegalSection id="collection" title="2. Information we collect">
        <p>
          <strong className="font-medium text-slate-700">Account and organization information.</strong>{' '}
          Name, business email, phone number, company name, job title, billing details, subscription
          plan, and authentication credentials for administrators and authorized users.
        </p>
        <p>
          <strong className="font-medium text-slate-700">Workforce and HR data.</strong> Information
          submitted by customers about employees and other workforce participants, which may include
          contact details, employment records, attendance and leave data, payroll-related fields,
          performance notes, documents, and other HR information configured by the customer.
        </p>
        <p>
          <strong className="font-medium text-slate-700">Usage and device information.</strong> IP
          address, browser type, device identifiers, pages viewed, feature usage, log files, crash
          reports, and approximate location derived from IP address.
        </p>
        <p>
          <strong className="font-medium text-slate-700">Communications.</strong> Support requests,
          feedback, survey responses, and other messages you send to us.
        </p>
        <p>
          <strong className="font-medium text-slate-700">Cookies and similar technologies.</strong>{' '}
          See Section 9 below.
        </p>
        <p>
          We do not intentionally collect sensitive categories of data unless a customer configures
          fields for lawful HR purposes and provides appropriate notices. Customers should avoid
          submitting unnecessary special-category data unless legally required and properly
          safeguarded.
        </p>
      </LegalSection>

      <LegalSection id="sources" title="3. How we obtain information">
        <p>We collect information:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Directly from you when you register, sign in, or contact support;</li>
          <li>From customer administrators who create or manage user accounts;</li>
          <li>Automatically through the Service, logs, and analytics tools;</li>
          <li>From service providers that help us operate the Service.</li>
        </ul>
      </LegalSection>

      <LegalSection id="use" title="4. How we use information">
        <p>We use personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide, operate, maintain, and secure the Service;</li>
          <li>Authenticate users and enforce access controls;</li>
          <li>Process subscriptions, invoices, and account administration;</li>
          <li>Respond to support requests and communicate about the Service;</li>
          <li>Monitor performance, troubleshoot, and prevent fraud or abuse;</li>
          <li>Comply with legal obligations and enforce our{' '}
            <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-700">
              Terms of Use
            </Link>
            ;
          </li>
          <li>Improve features and develop new functionality using aggregated or de-identified data where possible.</li>
        </ul>
        <p>
          We do not sell personal information. We do not use employee HR records for unrelated
          advertising profiling.
        </p>
      </LegalSection>

      <LegalSection id="legal-bases" title="5. Legal bases (EEA, UK, and similar regions)">
        <p>Where applicable, we rely on one or more of the following legal bases:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-slate-700">Contract</strong> — to provide the Service
            and perform our agreement with customers and users;
          </li>
          <li>
            <strong className="font-medium text-slate-700">Legitimate interests</strong> — to secure
            the Service, prevent misuse, and improve operations, balanced against your rights;
          </li>
          <li>
            <strong className="font-medium text-slate-700">Consent</strong> — where required for
            optional cookies or marketing communications;
          </li>
          <li>
            <strong className="font-medium text-slate-700">Legal obligation</strong> — to meet
            regulatory, tax, or law-enforcement requirements.
          </li>
        </ul>
        <p>
          When we process workforce data on behalf of customers, the customer determines the lawful
          basis and we process according to their documented instructions.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="6. How we share information">
        <p>We may share personal information with:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-slate-700">Service providers and sub-processors</strong>{' '}
            such as cloud hosting, email delivery, analytics, payment processing, and customer
            support tools, bound by contractual confidentiality and data-protection obligations;
          </li>
          <li>
            <strong className="font-medium text-slate-700">Customer administrators</strong> within
            the same tenant according to role-based permissions;
          </li>
          <li>
            <strong className="font-medium text-slate-700">Professional advisers</strong> such as
            lawyers, auditors, and insurers under confidentiality duties;
          </li>
          <li>
            <strong className="font-medium text-slate-700">Authorities</strong> when required by law,
            court order, or to protect rights, safety, and security;
          </li>
          <li>
            <strong className="font-medium text-slate-700">Business transfers</strong> in connection
            with a merger, acquisition, financing, or sale of assets, subject to continued
            protection of personal information.
          </li>
        </ul>
        <p>
          Customers may export or integrate data with third-party systems they authorize. Those
          integrations are governed by the third party&apos;s policies.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="7. International transfers">
        <p>
          We may process and store information in countries other than where it was collected,
          including the United States. Where required, we use appropriate safeguards such as Standard
          Contractual Clauses or equivalent mechanisms for cross-border transfers.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="8. Data retention">
        <p>
          We retain personal information for as long as needed to provide the Service, fulfill the
          purposes described in this Policy, comply with legal obligations, resolve disputes, and
          enforce agreements. Retention periods vary by data type and customer settings. When data
          is no longer required, we delete or de-identify it according to our retention schedule and
          applicable law.
        </p>
        <p>
          Customers may request export or deletion of tenant data subject to contractual terms and
          legal retention requirements.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="9. Cookies and analytics">
        <p>
          We use cookies and similar technologies for authentication, session management, security,
          preferences, and usage analytics. Essential cookies are required for the Service to function.
          Where required by law, we obtain consent for non-essential cookies.
        </p>
        <p>
          You can control cookies through browser settings. Disabling certain cookies may limit
          functionality. We do not respond to &quot;Do Not Track&quot; signals in a uniform way
          across all browsers.
        </p>
      </LegalSection>

      <LegalSection id="security" title="10. Security">
        <p>
          We implement administrative, technical, and organizational measures designed to protect
          personal information, including encryption in transit, access controls, tenant isolation,
          logging, and regular review of security practices. No method of transmission or storage is
          completely secure; we cannot guarantee absolute security.
        </p>
        <p>
          If we become aware of a personal data breach likely to pose a risk to your rights, we will
          notify affected customers and, where required, regulators and individuals in accordance
          with applicable law.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="11. Your privacy rights">
        <p>
          Depending on your location, you may have rights to access, correct, delete, restrict,
          object to processing, or receive a portable copy of your personal information, and to
          withdraw consent where processing is consent-based.
        </p>
        <p>
          <strong className="font-medium text-slate-700">Workforce users:</strong> If you are an
          employee or contractor whose organization uses {APP_NAME}, contact your employer first.
          They control most workforce data. We will assist customers in responding to valid requests
          as required by our agreements and applicable law.
        </p>
        <p>
          <strong className="font-medium text-slate-700">California residents:</strong> You may have
          additional rights under the CCPA/CPRA, including the right to know, delete, correct, and
          opt out of certain sharing. We do not sell personal information as defined by California
          law.
        </p>
        <p>
          To exercise rights relating to account data we control, contact us at{' '}
          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            {PRIVACY_CONTACT_EMAIL}
          </a>
          . We may verify your identity before responding. You may lodge a complaint with your
          local supervisory authority where applicable.
        </p>
      </LegalSection>

      <LegalSection id="children" title="12. Children">
        <p>
          The Service is not directed to individuals under 16, and we do not knowingly collect
          personal information from children. If you believe a child has provided us information,
          contact us so we can take appropriate action.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes to this Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised version and
          update the &quot;Last updated&quot; date. Material changes will be communicated by email
          or in-product notice where required by law. Continued use after the effective date
          constitutes acknowledgment of the updated Policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="14. Contact us">
        <p>
          Privacy inquiries and data subject requests:{' '}
          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            {PRIVACY_CONTACT_EMAIL}
          </a>
        </p>
        <p>
          Daily HR<br />
          Attn: Privacy Team<br />
          Email: {PRIVACY_CONTACT_EMAIL}
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};
