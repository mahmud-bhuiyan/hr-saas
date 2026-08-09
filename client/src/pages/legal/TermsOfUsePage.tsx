import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants/app';
import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from './constants';
import { LegalPageLayout, LegalSection } from './components/LegalPageLayout';

export const TermsOfUsePage = () => {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated={LEGAL_LAST_UPDATED}>
      <p className="text-sm leading-relaxed text-slate-600">
        These Terms of Use (&quot;Terms&quot;) govern access to and use of the {APP_NAME} cloud
        platform and related services (collectively, the &quot;Service&quot;) operated by Daily HR
        (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account, accessing, or
        using the Service, you agree to these Terms on behalf of yourself and the organization you
        represent (&quot;Customer,&quot; &quot;you,&quot; or &quot;your&quot;). If you do not agree,
        do not use the Service.
      </p>

      <LegalSection id="eligibility" title="1. Eligibility and authority">
        <p>
          You must be at least 18 years old and have authority to bind your organization to these
          Terms. The Service is intended for business use. You represent that registration
          information is accurate and that you will keep account credentials confidential.
        </p>
      </LegalSection>

      <LegalSection id="service" title="2. Description of the Service">
        <p>
          {APP_NAME} is a multi-tenant human resources software platform that may include employee
          records, attendance, leave, payroll, documents, reporting, and related administrative
          tools. Features may vary by subscription plan, tenant configuration, and enabled modules.
          We may modify, suspend, or discontinue features with reasonable notice where practicable.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="3. Accounts and access">
        <p>
          Customer administrators may invite users and assign roles. You are responsible for all
          activity under your accounts, including actions by employees and authorized third
          parties. You must promptly notify us of unauthorized access or security incidents
          affecting your account.
        </p>
        <p>
          We may suspend or terminate access for violations of these Terms, suspected fraud,
          non-payment, or risks to the Service or other customers.
        </p>
      </LegalSection>

      <LegalSection id="customer-data" title="4. Customer data and HR information">
        <p>
          You retain ownership of data you submit to the Service (&quot;Customer Data&quot;),
          including employee and workforce information. You grant us a limited license to host,
          process, transmit, and display Customer Data solely to provide, maintain, secure, and
          improve the Service and as otherwise described in our{' '}
          <Link to="/privacy" className="font-medium text-brand-600 hover:text-brand-700">
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          You are solely responsible for the accuracy, legality, and appropriateness of Customer
          Data and for obtaining any required notices, consents, and rights from employees and other
          individuals before submitting their information. You must not upload unlawful, infringing,
          or malicious content.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Violate applicable laws, regulations, or third-party rights;</li>
          <li>Probe, scan, or test the vulnerability of the Service without authorization;</li>
          <li>Interfere with or disrupt the Service, networks, or security controls;</li>
          <li>Reverse engineer, decompile, or attempt to derive source code except where permitted by law;</li>
          <li>Use the Service to send spam, malware, or unauthorized communications;</li>
          <li>Access the Service to build a competing product or for benchmarking without consent;</li>
          <li>Misrepresent identity or affiliation, or use another customer&apos;s tenant without permission.</li>
        </ul>
      </LegalSection>

      <LegalSection id="subscription" title="6. Subscriptions, fees, and taxes">
        <p>
          Paid plans, billing cycles, and usage limits are described at signup or in an order form.
          Fees are non-refundable except where required by law or expressly stated in writing.
          Overdue amounts may accrue interest and may result in suspension. You are responsible for
          applicable taxes, excluding taxes based on our net income.
        </p>
      </LegalSection>

      <LegalSection id="support" title="7. Support and service levels">
        <p>
          We use commercially reasonable efforts to maintain availability and provide support
          according to your plan. Unless otherwise agreed in a separate signed agreement, the Service
          is provided without guaranteed uptime or response-time commitments.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="8. Intellectual property">
        <p>
          We and our licensors retain all rights in the Service, software, documentation, branding,
          and underlying technology. These Terms do not grant you any ownership interest in the
          Service. Feedback you provide may be used without restriction or compensation.
        </p>
      </LegalSection>

      <LegalSection id="confidentiality" title="9. Confidentiality">
        <p>
          Each party may receive non-public information from the other. The receiving party will
          protect such information using reasonable care and use it only for purposes related to
          the Service, except as required by law or with consent.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="10. Third-party services">
        <p>
          The Service may integrate with third-party products or hosting providers. We are not
          responsible for third-party services, and your use of them may be subject to separate
          terms. Links to external sites are provided for convenience only.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="11. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY. WE DO
          NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT
          CUSTOMER DATA WILL NOT BE LOST OR ALTERED.
        </p>
        <p>
          {APP_NAME} supports HR workflows but does not provide legal, tax, payroll, or employment
          advice. You are responsible for compliance with labor, privacy, and industry-specific
          regulations in your jurisdiction.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="12. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY WILL BE LIABLE FOR INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, COVER, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS,
          REVENUE, DATA, OR GOODWILL. OUR TOTAL LIABILITY ARISING OUT OF OR RELATED TO THESE
          TERMS OR THE SERVICE WILL NOT EXCEED THE AMOUNTS PAID BY YOU TO US FOR THE SERVICE IN
          THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO LIABILITY, OR ONE HUNDRED U.S.
          DOLLARS (USD $100) IF NO FEES WERE PAID.
        </p>
        <p>
          Some jurisdictions do not allow certain limitations; in those cases, our liability is
          limited to the fullest extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="13. Indemnification">
        <p>
          You will defend, indemnify, and hold us harmless from claims, damages, and expenses
          (including reasonable attorneys&apos; fees) arising from Customer Data, your use of the
          Service in violation of these Terms or applicable law, or disputes with your employees or
          other workforce participants.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="14. Term and termination">
        <p>
          These Terms remain in effect while you use the Service. Either party may terminate for
          material breach if the breach is not cured within thirty (30) days of written notice. Upon
          termination, your right to access the Service ends. We will make Customer Data available
          for export for a reasonable period, after which we may delete it according to our retention
          practices and applicable law.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="15. Changes to these Terms">
        <p>
          We may update these Terms from time to time. We will post the revised Terms and update
          the &quot;Last updated&quot; date. Material changes will be communicated by email or
          in-product notice where required. Continued use after the effective date constitutes
          acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="16. Governing law and disputes">
        <p>
          These Terms are governed by the laws of the State of Delaware, USA, without regard to
          conflict-of-law principles, except where mandatory local consumer or employment laws
          apply. Disputes will be resolved in the state or federal courts located in Delaware,
          unless the parties agree to alternative dispute resolution in writing.
        </p>
      </LegalSection>

      <LegalSection id="general" title="17. General">
        <p>
          These Terms, together with applicable order forms and the Privacy Policy, constitute the
          entire agreement regarding the Service. If any provision is unenforceable, the remainder
          remains in effect. You may not assign these Terms without our consent; we may assign them
          in connection with a merger, acquisition, or sale of assets. Failure to enforce a provision
          is not a waiver.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="18. Contact">
        <p>
          Questions about these Terms:{' '}
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};
