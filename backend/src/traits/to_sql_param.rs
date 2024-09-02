pub trait ToSqlParam<'a> {
    type Out;
    fn to_param(&'a self) -> Self::Out;
}

pub trait SqlParamable {}

impl SqlParamable for String {}

impl SqlParamable for &str {}

impl<'a, T> ToSqlParam<'a> for Option<T>
where
    T: AsRef<str>,
{
    fn to_param(&'a self) -> Self::Out {
        self.as_ref().map(|x| x.as_ref())
    }

    type Out = Option<&'a str>;
}

impl<'a, T> ToSqlParam<'a> for T
where
    T: SqlParamable + AsRef<str>,
{
    fn to_param(&'a self) -> Self::Out {
        self.as_ref()
    }

    type Out = &'a str;
}
