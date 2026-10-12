const checkedAt = '2026-10-12'

export const destinationSources = {
  yamunotri: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=MQ==',
    checkedAt,
    verifiedFields: ['access'],
  },
  gangotri: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=Mg==',
    checkedAt,
    verifiedFields: ['description', 'access', 'altitude'],
  },
  kedarnath: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=Mw==',
    checkedAt,
    verifiedFields: ['access', 'transport'],
  },
  badrinath: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=NA==',
    checkedAt,
    verifiedFields: ['access'],
  },
}

export const destinationDataNotes = {
  schemaVersion: 1,
  operationalStatus: 'unknown',
  note: 'Official source pages describe access and destination facts; they are not a live open/closed feed. Verify terms before bulk republication.',
}
