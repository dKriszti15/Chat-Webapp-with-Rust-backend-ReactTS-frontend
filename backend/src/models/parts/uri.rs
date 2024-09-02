use nutype::nutype;

use crate::traits::SqlParamable;

#[nutype(
  sanitize(trim)
  validate(not_empty, max_len = 255)
)]
#[derive(AsRef, Deserialize, Serialize, Debug, Clone, Display)]
pub struct Uri(String);

impl SqlParamable for Uri {}
